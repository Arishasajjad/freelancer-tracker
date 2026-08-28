const ClientDocument = require('../models/ClientDocument');
const Client = require('../models/Client');

const uploadDocument = async (req, res) => {
  try {
    const { clientId } = req.params;

    const client = await Client.findOne({
      _id: clientId,
      user: req.user.userId
    });

    if (!client) {
      return res.status(404).json({
        message: 'Client not found'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: 'Please attach a file'
      });
    }

    const document = await ClientDocument.create({
      user: req.user.userId,
      client: clientId,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      fileType: req.file.mimetype,
      filePath: req.file.path,
      fileSize: req.file.size
    });

    res.status(201).json({
      message: 'Document uploaded successfully',
      document
    });

  } catch (error) {
    console.error('Upload error:', error);

    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};


const getClientDocuments = async (req, res) => {
  try {
    const { clientId } = req.params;

    const documents = await ClientDocument.find({
      client: clientId,
      user: req.user.userId
    }).sort({ createdAt: -1 });

    res.json(documents);

  } catch (error) {
    console.error('Get documents error:', error);

    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};


const deleteDocument = async (req, res) => {
  try {
    const document = await ClientDocument.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!document) {
      return res.status(404).json({
        message: 'Document not found'
      });
    }

    await ClientDocument.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete document error:', error);

    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};


module.exports = {
  uploadDocument,
  getClientDocuments,
  deleteDocument
};