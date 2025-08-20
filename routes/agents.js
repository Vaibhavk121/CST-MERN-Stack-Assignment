const express = require('express');
const { body, validationResult } = require('express-validator');
const Agent = require('../models/Agent');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/agents
// @desc    Create a new agent
// @access  Private
router.post('/', [
  auth,
  body('name').trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('mobile.countryCode').notEmpty(),
  body('mobile.number').isMobilePhone(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Invalid input data',
        errors: errors.array() 
      });
    }

    const { name, email, mobile, password } = req.body;

    // Check if agent already exists
    const existingAgent = await Agent.findOne({ email });
    if (existingAgent) {
      return res.status(400).json({ message: 'Agent with this email already exists' });
    }

    // Create new agent
    const agent = new Agent({
      name,
      email,
      mobile,
      password
    });

    await agent.save();

    // Return agent without password
    const agentResponse = {
      id: agent._id,
      name: agent.name,
      email: agent.email,
      mobile: agent.mobile,
      isActive: agent.isActive,
      createdAt: agent.createdAt
    };

    res.status(201).json({
      message: 'Agent created successfully',
      agent: agentResponse
    });
  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/agents
// @desc    Get all agents
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const agents = await Agent.find().select('-password').sort({ createdAt: -1 });
    res.json({ agents });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/agents/:id
// @desc    Get agent by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id).select('-password');
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    res.json({ agent });
  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/agents/:id
// @desc    Update agent
// @access  Private
router.put('/:id', [
  auth,
  body('name').optional().trim().isLength({ min: 2 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('mobile.countryCode').optional().notEmpty(),
  body('mobile.number').optional().isMobilePhone()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Invalid input data',
        errors: errors.array() 
      });
    }

    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-password');

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.json({
      message: 'Agent updated successfully',
      agent
    });
  } catch (error) {
    console.error('Update agent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/agents/:id
// @desc    Delete agent
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const agent = await Agent.findByIdAndDelete(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;