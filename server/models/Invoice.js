const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },

    milestone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone',
      default: null
    },

    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    issueDate: {
      type: Date,
      default: Date.now
    },

    dueDate: {
      type: Date,
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: [
        'Draft',
        'Sent',
        'Paid',
        'Overdue',
        'Cancelled'
      ],
      default: 'Draft'
    },

    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Invoice', invoiceSchema);