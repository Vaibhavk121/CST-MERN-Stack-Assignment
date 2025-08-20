const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const List = require('../models/List');
const Agent = require('../models/Agent');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.csv', '.xlsx', '.xls'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV, XLSX, and XLS files are allowed'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Function to parse CSV file
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Validate required fields
        if (data.FirstName && data.Phone) {
          results.push({
            firstName: data.FirstName.trim(),
            phone: data.Phone.trim(),
            notes: data.Notes ? data.Notes.trim() : ''
          });
        }
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

// Function to parse Excel file
const parseExcel = (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    return jsonData.map(row => ({
      firstName: row.FirstName ? row.FirstName.toString().trim() : '',
      phone: row.Phone ? row.Phone.toString().trim() : '',
      notes: row.Notes ? row.Notes.toString().trim() : ''
    })).filter(item => item.firstName && item.phone);
  } catch (error) {
    throw new Error('Error parsing Excel file');
  }
};

// Function to distribute items among agents
const distributeItems = (items, agents) => {
  const distributions = [];
  const itemsPerAgent = Math.floor(items.length / agents.length);
  const remainingItems = items.length % agents.length;
  
  let currentIndex = 0;
  
  agents.forEach((agent, index) => {
    const itemCount = itemsPerAgent + (index < remainingItems ? 1 : 0);
    const agentItems = items.slice(currentIndex, currentIndex + itemCount);
    
    distributions.push({
      agent: agent._id,
      items: agentItems,
      itemCount: agentItems.length
    });
    
    currentIndex += itemCount;
  });
  
  return distributions;
};

// @route   POST /api/lists/upload
// @desc    Upload and distribute CSV/Excel file
// @access  Private
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    
    let items = [];
    
    // Parse file based on extension
    if (fileExtension === '.csv') {
      items = await parseCSV(filePath);
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      items = parseExcel(filePath);
    }
    
    if (items.length === 0) {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({ 
        message: 'No valid data found in file. Please ensure the file has FirstName and Phone columns.' 
      });
    }

    // Get all active agents
    const agents = await Agent.find({ isActive: true }).limit(5);
    if (agents.length === 0) {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: 'No active agents found. Please add agents first.' });
    }

    // Distribute items among agents
    const distributions = distributeItems(items, agents);

    // Save to database
    const list = new List({
      fileName: req.file.originalname,
      totalItems: items.length,
      uploadedBy: req.user._id,
      distributions
    });

    await list.save();

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // Populate agent details for response
    await list.populate('distributions.agent', 'name email');

    res.status(201).json({
      message: 'File uploaded and distributed successfully',
      list: {
        id: list._id,
        fileName: list.fileName,
        totalItems: list.totalItems,
        distributions: list.distributions.map(dist => ({
          agent: {
            id: dist.agent._id,
            name: dist.agent.name,
            email: dist.agent.email
          },
          itemCount: dist.itemCount,
          items: dist.items
        })),
        createdAt: list.createdAt
      }
    });
  } catch (error) {
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: error.message || 'Error processing file upload' 
    });
  }
});

// @route   GET /api/lists
// @desc    Get all uploaded lists
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const lists = await List.find()
      .populate('uploadedBy', 'email')
      .populate('distributions.agent', 'name email')
      .sort({ createdAt: -1 });

    const formattedLists = lists.map(list => ({
      id: list._id,
      fileName: list.fileName,
      totalItems: list.totalItems,
      uploadedBy: list.uploadedBy ? list.uploadedBy.email : 'Unknown',
      distributions: list.distributions.map(dist => ({
        agent: dist.agent ? {
          id: dist.agent._id,
          name: dist.agent.name,
          email: dist.agent.email
        } : null,
        itemCount: dist.itemCount
      })),
      createdAt: list.createdAt
    }));

    res.json({ lists: formattedLists });
  } catch (error) {
    console.error('Get lists error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/lists/:id
// @desc    Get list details with full distribution
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id)
      .populate('uploadedBy', 'email')
      .populate('distributions.agent', 'name email');

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const formattedList = {
      id: list._id,
      fileName: list.fileName,
      totalItems: list.totalItems,
      uploadedBy: list.uploadedBy ? list.uploadedBy.email : 'Unknown',
      distributions: list.distributions.map(dist => ({
        agent: dist.agent ? {
          id: dist.agent._id,
          name: dist.agent.name,
          email: dist.agent.email
        } : null,
        itemCount: dist.itemCount,
        items: dist.items
      })),
      createdAt: list.createdAt
    };

    res.json({ list: formattedList });
  } catch (error) {
    console.error('Get list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;