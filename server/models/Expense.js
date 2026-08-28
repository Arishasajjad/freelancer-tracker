const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    expenseDate: {
      type: Date,
      default: Date.now
    },
    paymentMethod: {
      type: String,
      enum: ['Bank Transfer', 'Cash', 'Credit Card', 'Debit Card', 'PayPal', 'Other'],
      default: 'Bank Transfer'
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending'],
      default: 'Paid'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
