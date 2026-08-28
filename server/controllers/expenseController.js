const Expense = require('../models/Expense');

const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.userId })
      .sort({ expenseDate: -1 });

    res.json({ expenses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to get expenses' });
  }
};

const createExpense = async (req, res) => {
  try {
    const { category, description, amount, expenseDate, paymentMethod, status, notes } = req.body;

    if (!category?.trim() || !description?.trim()) {
      return res.status(400).json({ message: 'Category and description are required' });
    }

    if (amount === undefined || amount === '' || Number(amount) < 0) {
      return res.status(400).json({ message: 'A valid expense amount is required' });
    }

    const expense = await Expense.create({
      user: req.user.userId,
      category: category.trim(),
      description: description.trim(),
      amount: Number(amount),
      expenseDate,
      paymentMethod,
      status,
      notes: notes?.trim() || ''
    });

    res.status(201).json({ message: 'Expense created successfully', expense });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create expense' });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { category, description, amount, expenseDate, paymentMethod, status, notes } = req.body;

    if (!category?.trim() || !description?.trim()) {
      return res.status(400).json({ message: 'Category and description are required' });
    }

    if (amount === undefined || amount === '' || Number(amount) < 0) {
      return res.status(400).json({ message: 'A valid expense amount is required' });
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      {
        category: category.trim(),
        description: description.trim(),
        amount: Number(amount),
        expenseDate,
        paymentMethod,
        status,
        notes: notes?.trim() || ''
      },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense updated successfully', expense });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update expense' });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete expense' });
  }
};

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense };
