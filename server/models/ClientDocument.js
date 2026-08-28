const mongoose = require('mongoose');

const clientDocumentSchema = new mongoose.Schema(
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

    originalName: {
      type: String,
      required: true
    },

    fileName: {
      type: String,
      required: true
    },

    fileType: {
      type: String,
      required: true
    },

    filePath: {
      type: String,
      required: true
    },

    fileSize: {
      type: Number
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  'ClientDocument',
  clientDocumentSchema
);