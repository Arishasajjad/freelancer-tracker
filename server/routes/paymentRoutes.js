const express = require('express');

const {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment
} = require('../controllers/paymentController');

const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all payments
router.get('/', authMiddleware, getPayments);

// Create payment
router.post('/', authMiddleware, createPayment);

// Update payment
router.put('/:id', authMiddleware, updatePayment);

// Delete payment
router.delete('/:id', authMiddleware, deletePayment);

module.exports = router;