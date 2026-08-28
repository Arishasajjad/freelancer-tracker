const Client = require('../models/Client');
const Project = require('../models/Project');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const Expense = require('../models/Expense');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [
      totalClients,
      totalProjects,
      activeProjects,
      completedProjects,
      invoices,
      payments,
      expenses,
      recentProjects
    ] = await Promise.all([
      Client.countDocuments({ user: userId }),

      Project.countDocuments({ user: userId }),

      Project.countDocuments({
        user: userId,
        status: 'In Progress'
      }),

      Project.countDocuments({
        user: userId,
        status: 'Completed'
      }),

      Invoice.find({ user: userId }),

      Payment.find({ user: userId }),

      Expense.find({ user: userId }),

      Project.find({ user: userId })
        .populate('client', 'name')
        .sort({ updatedAt: -1 })
        .limit(5)
    ]);

    const totalInvoiced = invoices.reduce(
      (sum, invoice) =>
        sum + Number(invoice.amount || 0),
      0
    );

    const totalPaid = payments
      .filter(
        (payment) =>
          payment.status === 'Completed'
      )
      .reduce(
        (sum, payment) =>
          sum + Number(payment.amount || 0),
        0
      );

    const totalExpenses = expenses
      .filter(
        (expense) =>
          expense.status === 'Paid'
      )
      .reduce(
        (sum, expense) =>
          sum + Number(expense.amount || 0),
        0
      );

    const pendingAmount =
      totalInvoiced - totalPaid;

    const netProfit =
      totalPaid - totalExpenses;

    res.json({
      totalClients,
      totalProjects,
      activeProjects,
      completedProjects,
      totalInvoiced,
      totalPaid,
      totalExpenses,
      pendingAmount,
      netProfit,
      recentProjects
    });
  } catch (error) {
    console.error('Dashboard error:', error);

    res.status(500).json({
      message: 'Failed to load dashboard data'
    });
  }
};

module.exports = {
  getDashboardStats
};