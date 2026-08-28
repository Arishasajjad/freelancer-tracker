const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');

// Get all payments
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      user: req.user.userId
    })
      .populate({
        path: 'invoice',
        populate: [
          { path: 'client', select: 'name email company' },
          { path: 'project', select: 'title price' }
        ]
      })
      .sort({ paymentDate: -1 });

    res.json({ payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to get payments'
    });
  }
};

// Create payment
const createPayment = async (req, res) => {
  try {
    const {
      invoice,
      amount,
      paymentDate,
      paymentMethod,
      status,
      notes
    } = req.body;

    if (!invoice) {
      return res.status(400).json({
        message: 'Invoice is required'
      });
    }

    if (amount === undefined || amount === '') {
      return res.status(400).json({
        message: 'Amount is required'
      });
    }

    const invoiceData = await Invoice.findOne({
      _id: invoice,
      user: req.user.userId
    });

    if (!invoiceData) {
      return res.status(404).json({
        message: 'Invoice not found'
      });
    }

    const payment = await Payment.create({
      user: req.user.userId,
      invoice,
      amount,
      paymentDate,
      paymentMethod,
      status,
      notes
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate({
        path: 'invoice',
        populate: [
          { path: 'client', select: 'name email company' },
          { path: 'project', select: 'title price' }
        ]
      });

    res.status(201).json({
      message: 'Payment created successfully',
      payment: populatedPayment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to create payment'
    });
  }
};

// Update payment
const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!payment) {
      return res.status(404).json({
        message: 'Payment not found'
      });
    }

    const {
      invoice,
      amount,
      paymentDate,
      paymentMethod,
      status,
      notes
    } = req.body;

    if (invoice !== undefined) payment.invoice = invoice;
    if (amount !== undefined) payment.amount = amount;
    if (paymentDate !== undefined) payment.paymentDate = paymentDate;
    if (paymentMethod !== undefined) payment.paymentMethod = paymentMethod;
    if (status !== undefined) payment.status = status;
    if (notes !== undefined) payment.notes = notes;

    await payment.save();

    const updatedPayment = await Payment.findById(payment._id)
      .populate({
        path: 'invoice',
        populate: [
          { path: 'client', select: 'name email company' },
          { path: 'project', select: 'title price' }
        ]
      });

    res.json({
      message: 'Payment updated successfully',
      payment: updatedPayment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to update payment'
    });
  }
};

// Delete payment
const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!payment) {
      return res.status(404).json({
        message: 'Payment not found'
      });
    }

    res.json({
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Failed to delete payment'
    });
  }
};

module.exports = {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment
};