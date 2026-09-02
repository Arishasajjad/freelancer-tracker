import { useEffect, useState } from 'react';

const API_URL = 'https://freelancer-tracker-pn21.onrender.com';

const emptyForm = {
  category: 'Software & Subscriptions',
  description: '',
  amount: '',
  expenseDate: '',
  paymentMethod: 'Bank Transfer',
  status: 'Paid',
  notes: ''
};

const getInputDate = (date) => {
  if (!date) return '';
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) return date.slice(0, 10);

  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
};

const formatDate = (date) => {
  const cleanDate = getInputDate(date);
  if (!cleanDate) return 'No date';
  const [year, month, day] = cleanDate.split('-');
  return `${day}/${month}/${year}`;
};

const formatPrice = (amount) => `PKR ${Number(amount || 0).toLocaleString()}`;

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const token = localStorage.getItem('token');

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/expenses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setExpenses(response.ok && Array.isArray(data.expenses) ? data.expenses : []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleAddExpense = () => {
    setEditingExpense(null);
    setForm({ ...emptyForm });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setForm({
      category: expense.category || 'Software & Subscriptions',
      description: expense.description || '',
      amount: expense.amount !== undefined && expense.amount !== null ? String(expense.amount) : '',
      expenseDate: getInputDate(expense.expenseDate),
      paymentMethod: expense.paymentMethod || 'Bank Transfer',
      status: expense.status || 'Paid',
      notes: expense.notes || ''
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingExpense(null);
    setForm({ ...emptyForm });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.category.trim() || !form.description.trim()) {
      alert('Category and description are required.');
      return;
    }

    if (form.amount === '' || Number(form.amount) < 0) {
      alert('Enter a valid expense amount.');
      return;
    }

    setSaving(true);

    try {
      const expenseData = {
        ...form,
        amount: Number(form.amount),
        expenseDate: form.expenseDate ? `${form.expenseDate}T00:00:00.000Z` : null,
        notes: form.notes.trim()
      };
      const expenseId = editingExpense?._id || editingExpense?.id;
      const response = await fetch(
        editingExpense ? `${API_URL}/expenses/${expenseId}` : `${API_URL}/expenses`,
        {
          method: editingExpense ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(expenseData)
        }
      );
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to save expense.');
        return;
      }

      alert(editingExpense ? 'Expense updated successfully!' : 'Expense created successfully!');
      handleCancel();
      await fetchExpenses();
    } catch (error) {
      console.error('Expense save error:', error);
      alert('Something went wrong while saving the expense.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      const response = await fetch(`${API_URL}/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to delete expense.');
        return;
      }

      alert('Expense deleted successfully!');
      setExpenses((previous) => previous.filter((expense) => (expense._id || expense.id) !== expenseId));
    } catch (error) {
      console.error('Delete expense error:', error);
      alert('Something went wrong while deleting the expense.');
    }
  };

  if (loading) {
    return <div className="expenses-page"><div className="page-placeholder"><p>Loading expenses...</p></div></div>;
  }

  return (
    <div className="expenses-page">
      <div className="expenses-page-header">
        <div>
          <p className="expenses-eyebrow">Track your costs</p>
          <h1>Expenses</h1>
          <p className="expenses-subtitle">Record and manage the costs of running your freelance business.</p>
        </div>
        <button type="button" className="primary-button" onClick={handleAddExpense}>+ Add Expense</button>
      </div>

      {showForm && (
        <div className="panel expense-form-panel">
          <div className="expense-form-header">
            <h2>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h2>
            <p>{editingExpense ? 'Update expense information.' : 'Record a business expense.'}</p>
          </div>
          <form className="expense-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={form.category} onChange={handleChange}>
                <option>Software &amp; Subscriptions</option>
                <option>Equipment</option>
                <option>Internet &amp; Utilities</option>
                <option>Marketing</option>
                <option>Travel</option>
                <option>Professional Services</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <input name="description" value={form.description} onChange={handleChange} placeholder="e.g. Adobe Creative Cloud" />
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input type="number" name="amount" min="0" value={form.amount} onChange={handleChange} placeholder="5000" />
            </div>
            <div className="form-group">
              <label>Expense Date</label>
              <input type="date" name="expenseDate" value={form.expenseDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
                <option>Bank Transfer</option><option>Cash</option><option>Credit Card</option><option>Debit Card</option><option>PayPal</option><option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}><option>Paid</option><option>Pending</option></select>
            </div>
            <div className="form-group full-width">
              <label>Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows="4" placeholder="Add expense notes..." />
            </div>
            <div className="form-buttons">
              <button type="submit" className="primary-button" disabled={saving}>{saving ? 'Saving...' : editingExpense ? 'Update Expense' : 'Create Expense'}</button>
              <button type="button" className="cancel-button" onClick={handleCancel} disabled={saving}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="panel expenses-list-panel">
        <div className="expenses-list-header">
          <div><h2>All Expenses</h2><p>{expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}</p></div>
          <span className="expense-count">{expenses.length} Total</span>
        </div>
        {expenses.length === 0 ? (
          <div className="expenses-empty"><div className="expenses-empty-icon">🧾</div><h3>No expenses yet</h3><p>Record your first expense to track your business costs.</p><button type="button" className="primary-button" onClick={handleAddExpense}>+ Add Expense</button></div>
        ) : (
          <div className="expenses-list">
            {expenses.map((expense) => {
              const expenseId = expense._id || expense.id;
              return <div className="expense-row" key={expenseId}>
                <div className="expense-icon">₨</div>
                <div className="expense-main-info"><h3>{expense.description}</h3><p>{expense.category}</p>{expense.notes && <small>{expense.notes}</small>}</div>
                <div className="expense-meta"><span>Amount</span><strong>{formatPrice(expense.amount)}</strong></div>
                <div className="expense-meta"><span>Date</span><strong>{formatDate(expense.expenseDate)}</strong></div>
                <div className="expense-meta"><span>Method</span><strong>{expense.paymentMethod}</strong></div>
                <div className="expense-actions"><span className={`expense-status ${expense.status === 'Paid' ? 'expense-paid' : 'expense-pending'}`}>{expense.status}</span><div className="expense-buttons"><button type="button" className="edit-project-button" onClick={() => handleEdit(expense)}>Edit</button><button type="button" className="delete-project-button" onClick={() => handleDelete(expenseId)}>Delete</button></div></div>
              </div>;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Expenses;
