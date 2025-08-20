const mongoose = require('mongoose');

const listItemSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
});

const listSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  totalItems: {
    type: Number,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  distributions: [{
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      required: true
    },
    items: [listItemSchema],
    itemCount: {
      type: Number,
      required: true
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('List', listSchema);