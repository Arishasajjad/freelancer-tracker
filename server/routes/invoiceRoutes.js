const express = require('express');

const router = express.Router();

const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice
} = require('../controllers/invoiceController');

const authMiddleware = require('../middleware/authMiddleware');

// =========================================================
// INVOICE ROUTES
// =========================================================

// GET all invoices
router.get(
  '/',
  authMiddleware,
  getInvoices
);

// GET single invoice
router.get(
  '/:id',
  authMiddleware,
  getInvoiceById
);

// CREATE invoice
router.post(
  '/',
  authMiddleware,
  createInvoice
);

// UPDATE invoice
router.put(
  '/:id',
  authMiddleware,
  updateInvoice
);

// DELETE invoice
router.delete(
  '/:id',
  authMiddleware,
  deleteInvoice
);

module.exports = router;