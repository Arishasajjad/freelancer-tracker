const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const Project = require('../models/Project');
const Milestone = require('../models/Milestone');

// =========================================================
// CREATE INVOICE
// =========================================================

const createInvoice = async (req, res) => {
  try {
    const {
      client,
      project,
      milestone,
      invoiceNumber,
      issueDate,
      dueDate,
      amount,
      status,
      notes
    } = req.body;

    // Required fields
    if (!client) {
      return res.status(400).json({
        message: 'Client is required'
      });
    }

    if (!project) {
      return res.status(400).json({
        message: 'Project is required'
      });
    }

    if (!invoiceNumber) {
      return res.status(400).json({
        message: 'Invoice number is required'
      });
    }

    if (!dueDate) {
      return res.status(400).json({
        message: 'Due date is required'
      });
    }

    if (amount === undefined || amount === null || amount === '') {
      return res.status(400).json({
        message: 'Amount is required'
      });
    }

    if (Number(amount) < 0) {
      return res.status(400).json({
        message: 'Amount cannot be negative'
      });
    }

    // =====================================================
    // CHECK CLIENT
    // =====================================================

    const clientExists = await Client.findOne({
      _id: client,
      user: req.user.userId
    });

    if (!clientExists) {
      return res.status(404).json({
        message: 'Client not found'
      });
    }

    // =====================================================
    // CHECK PROJECT
    // =====================================================

    const projectExists = await Project.findOne({
      _id: project,
      user: req.user.userId
    });

    if (!projectExists) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }

    // Make sure selected project belongs to selected client
    if (
      projectExists.client &&
      projectExists.client.toString() !== client.toString()
    ) {
      return res.status(400).json({
        message: 'Selected project does not belong to selected client'
      });
    }

    // =====================================================
    // CHECK MILESTONE IF PROVIDED
    // =====================================================

    let milestoneExists = null;

    if (milestone) {
      milestoneExists = await Milestone.findOne({
        _id: milestone,
        project: project
      });

      if (!milestoneExists) {
        return res.status(404).json({
          message: 'Milestone not found for this project'
        });
      }
    }

    // =====================================================
    // CHECK DUPLICATE INVOICE NUMBER
    // =====================================================

    const existingInvoice = await Invoice.findOne({
      invoiceNumber: invoiceNumber.trim()
    });

    if (existingInvoice) {
      return res.status(400).json({
        message: 'Invoice number already exists'
      });
    }

    // =====================================================
    // CREATE
    // =====================================================

    const invoice = await Invoice.create({
      user: req.user.userId,
      client,
      project,
      milestone: milestone || null,
      invoiceNumber: invoiceNumber.trim(),
      issueDate: issueDate || Date.now(),
      dueDate,
      amount: Number(amount),
      status: status || 'Draft',
      notes: notes ? notes.trim() : ''
    });

    // Populate related information
    await invoice.populate([
      {
        path: 'client',
        select: 'name email phone company'
      },
      {
        path: 'project',
        select: 'title status price deadline'
      },
      {
        path: 'milestone',
        select: 'title price dueDate status'
      }
    ]);

    return res.status(201).json({
      message: 'Invoice created successfully',
      invoice
    });

  } catch (error) {
    console.error('Create invoice error:', error);

    return res.status(500).json({
      message: 'Server error while creating invoice',
      error: error.message
    });
  }
};


// =========================================================
// GET ALL INVOICES
// =========================================================

const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({
      user: req.user.userId
    })
      .populate('client', 'name email phone company')
      .populate('project', 'title status price deadline')
      .populate('milestone', 'title price dueDate status')
      .sort({
        createdAt: -1
      });

    return res.status(200).json({
      invoices
    });

  } catch (error) {
    console.error('Get invoices error:', error);

    return res.status(500).json({
      message: 'Server error while fetching invoices',
      error: error.message
    });
  }
};


// =========================================================
// GET SINGLE INVOICE
// =========================================================

const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.user.userId
    })
      .populate('client', 'name email phone company')
      .populate('project', 'title status price deadline')
      .populate('milestone', 'title price dueDate status');

    if (!invoice) {
      return res.status(404).json({
        message: 'Invoice not found'
      });
    }

    return res.status(200).json({
      invoice
    });

  } catch (error) {
    console.error('Get invoice error:', error);

    return res.status(500).json({
      message: 'Server error while fetching invoice',
      error: error.message
    });
  }
};


// =========================================================
// UPDATE INVOICE
// =========================================================

const updateInvoice = async (req, res) => {
  try {
    const {
      client,
      project,
      milestone,
      invoiceNumber,
      issueDate,
      dueDate,
      amount,
      status,
      notes
    } = req.body;

    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!invoice) {
      return res.status(404).json({
        message: 'Invoice not found'
      });
    }

    // =====================================================
    // CHECK CLIENT
    // =====================================================

    if (client) {
      const clientExists = await Client.findOne({
        _id: client,
        user: req.user.userId
      });

      if (!clientExists) {
        return res.status(404).json({
          message: 'Client not found'
        });
      }

      invoice.client = client;
    }

    // =====================================================
    // CHECK PROJECT
    // =====================================================

    if (project) {
      const projectExists = await Project.findOne({
        _id: project,
        user: req.user.userId
      });

      if (!projectExists) {
        return res.status(404).json({
          message: 'Project not found'
        });
      }

      const selectedClient = client || invoice.client;

      if (
        projectExists.client &&
        projectExists.client.toString() !== selectedClient.toString()
      ) {
        return res.status(400).json({
          message: 'Selected project does not belong to selected client'
        });
      }

      invoice.project = project;
    }

    // =====================================================
    // CHECK MILESTONE
    // =====================================================

    if (milestone !== undefined) {
      if (milestone === null || milestone === '') {
        invoice.milestone = null;
      } else {
        const milestoneExists = await Milestone.findOne({
          _id: milestone,
          project: project || invoice.project
        });

        if (!milestoneExists) {
          return res.status(404).json({
            message: 'Milestone not found for this project'
          });
        }

        invoice.milestone = milestone;
      }
    }

    // =====================================================
    // INVOICE NUMBER
    // =====================================================

    if (invoiceNumber) {
      const duplicate = await Invoice.findOne({
        invoiceNumber: invoiceNumber.trim(),
        _id: {
          $ne: invoice._id
        }
      });

      if (duplicate) {
        return res.status(400).json({
          message: 'Invoice number already exists'
        });
      }

      invoice.invoiceNumber = invoiceNumber.trim();
    }

    // =====================================================
    // OTHER FIELDS
    // =====================================================

    if (issueDate) {
      invoice.issueDate = issueDate;
    }

    if (dueDate) {
      invoice.dueDate = dueDate;
    }

    if (amount !== undefined && amount !== '') {
      if (Number(amount) < 0) {
        return res.status(400).json({
          message: 'Amount cannot be negative'
        });
      }

      invoice.amount = Number(amount);
    }

    if (status) {
      invoice.status = status;
    }

    if (notes !== undefined) {
      invoice.notes = notes.trim();
    }

    await invoice.save();

    await invoice.populate([
      {
        path: 'client',
        select: 'name email phone company'
      },
      {
        path: 'project',
        select: 'title status price deadline'
      },
      {
        path: 'milestone',
        select: 'title price dueDate status'
      }
    ]);

    return res.status(200).json({
      message: 'Invoice updated successfully',
      invoice
    });

  } catch (error) {
    console.error('Update invoice error:', error);

    return res.status(500).json({
      message: 'Server error while updating invoice',
      error: error.message
    });
  }
};


// =========================================================
// DELETE INVOICE
// =========================================================

const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!invoice) {
      return res.status(404).json({
        message: 'Invoice not found'
      });
    }

    return res.status(200).json({
      message: 'Invoice deleted successfully'
    });

  } catch (error) {
    console.error('Delete invoice error:', error);

    return res.status(500).json({
      message: 'Server error while deleting invoice',
      error: error.message
    });
  }
};


// =========================================================
// EXPORT
// =========================================================

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice
};