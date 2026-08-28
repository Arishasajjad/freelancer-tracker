const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');

const router = express.Router();

router.get('/', authMiddleware, getExpenses);
router.post('/', authMiddleware, createExpense);
router.put('/:id', authMiddleware, updateExpense);
router.delete('/:id', authMiddleware, deleteExpense);

module.exports = router;
