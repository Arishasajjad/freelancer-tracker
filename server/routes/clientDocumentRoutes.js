const express = require('express');
const multer = require('multer');

const authMiddleware = require('../middleware/authMiddleware');

const {
  uploadDocument,
  getClientDocuments,
  deleteDocument
} = require('../controllers/clientDocumentController');

const router = express.Router();

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

// Upload a document/image for a client
router.post(
  '/client/:clientId',
  authMiddleware,
  upload.single('file'),
  uploadDocument
);

// Get all documents for a client
router.get(
  '/client/:clientId',
  authMiddleware,
  getClientDocuments
);

// Delete a document
router.delete(
  '/:id',
  authMiddleware,
  deleteDocument
);

module.exports = router;