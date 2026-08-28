const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    paymentDate: {
      type: Date,
      default: Date.now
    },

    paymentMethod: {
      type: String,
      enum: [
        'Bank Transfer',
        'Cash',
        'Credit Card',
        'Debit Card',
        'PayPal',
        'Other'
      ],
      default: 'Bank Transfer'
    },

    status: {
      type: String,
      enum: [
        'Pending',
        'Completed',
        'Failed'
      ],
      default: 'Completed'
    },

    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Payment', paymentSchema);