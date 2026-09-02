import { useEffect, useState } from 'react';

const API_URL = 'https://freelancer-tracker-pn21.onrender.com';

const emptyForm = {
  invoice: '',
  amount: '',
  paymentDate: '',
  paymentMethod: 'Bank Transfer',
  status: 'Completed',
  notes: ''
};

function Payments() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const token = localStorage.getItem('token');

  // =========================
  // DATE
  // =========================

  const getInputDate = (date) => {
    if (!date) return '';

    if (
      typeof date === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      return date;
    }

    if (typeof date === 'string') {
      const match = date.match(/^(\d{4}-\d{2}-\d{2})/);

      if (match) {
        return match[1];
      }
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    return parsed.toISOString().split('T')[0];
  };

  const formatDate = (date) => {
    const cleanDate = getInputDate(date);

    if (!cleanDate) {
      return 'No date';
    }

    const [year, month, day] = cleanDate.split('-');

    return `${day}/${month}/${year}`;
  };

  // =========================
  // MONEY
  // =========================

  const formatPrice = (amount) => {
    return `PKR ${Number(amount || 0).toLocaleString()}`;
  };

  // =========================
  // GET PAYMENTS
  // =========================

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/payments`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      console.log('Payments response:', data);

      if (response.ok) {
        if (Array.isArray(data)) {
          setPayments(data);
        } else if (Array.isArray(data.payments)) {
          setPayments(data.payments);
        } else if (Array.isArray(data.data)) {
          setPayments(data.data);
        } else {
          setPayments([]);
        }
      } else {
        console.error(data);
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GET INVOICES
  // =========================

  const fetchInvoices = async () => {
    try {
      const response = await fetch(
        `${API_URL}/invoices`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      console.log('Invoices response:', data);

      if (response.ok) {
        if (Array.isArray(data)) {
          setInvoices(data);
        } else if (Array.isArray(data.invoices)) {
          setInvoices(data.invoices);
        } else if (Array.isArray(data.data)) {
          setInvoices(data.data);
        } else {
          setInvoices([]);
        }
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    }
  };

  // =========================
  // LOAD
  // =========================

  useEffect(() => {
    fetchPayments();
    fetchInvoices();
  }, []);

  // =========================
  // INPUT
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // =========================
  // ADD
  // =========================

  const handleAddPayment = () => {
    setEditingPayment(null);

    setForm({
      ...emptyForm
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (payment) => {
    setEditingPayment(payment);

    setForm({
      invoice:
        payment.invoice?._id ||
        payment.invoice?.id ||
        payment.invoice ||
        '',

      amount:
        payment.amount !== undefined &&
        payment.amount !== null
          ? String(payment.amount)
          : '',

      paymentDate:
        getInputDate(payment.paymentDate),

      paymentMethod:
        payment.paymentMethod ||
        'Bank Transfer',

      status:
        payment.status ||
        'Completed',

      notes:
        payment.notes ||
        ''
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // =========================
  // CANCEL
  // =========================

  const handleCancel = () => {
    setShowForm(false);
    setEditingPayment(null);

    setForm({
      ...emptyForm
    });
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.invoice) {
      alert('Please select an invoice.');
      return;
    }

    if (form.amount === '') {
      alert('Payment amount is required.');
      return;
    }

    if (Number(form.amount) < 0) {
      alert('Amount cannot be negative.');
      return;
    }

    setSaving(true);

    try {
      const paymentData = {
        invoice: form.invoice,
        amount: Number(form.amount),
        paymentDate: form.paymentDate
          ? `${form.paymentDate}T00:00:00.000Z`
          : null,
        paymentMethod: form.paymentMethod,
        status: form.status,
        notes: form.notes.trim()
      };

      console.log(
        'Sending payment:',
        paymentData
      );

      let response;

      // UPDATE
      if (editingPayment) {
        const paymentId =
          editingPayment._id ||
          editingPayment.id;

        response = await fetch(
          `${API_URL}/payments/${paymentId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(paymentData)
          }
        );
      }

      // CREATE
      else {
        response = await fetch(
          `${API_URL}/payments`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(paymentData)
          }
        );
      }

      const data = await response.json();

      console.log(
        'Payment save response:',
        data
      );

      if (response.ok) {
        alert(
          editingPayment
            ? 'Payment updated successfully!'
            : 'Payment created successfully!'
        );

        handleCancel();

        await fetchPayments();
      } else {
        alert(
          data.message ||
          'Failed to save payment.'
        );
      }
    } catch (error) {
      console.error(
        'Payment save error:',
        error
      );

      alert(
        'Something went wrong while saving the payment.'
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (paymentId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this payment?'
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/payments/${paymentId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(
          'Payment deleted successfully!'
        );

        setPayments((previous) =>
          previous.filter(
            (payment) =>
              (payment._id || payment.id) !==
              paymentId
          )
        );
      } else {
        alert(
          data.message ||
          'Failed to delete payment.'
        );
      }
    } catch (error) {
      console.error(
        'Delete payment error:',
        error
      );

      alert(
        'Something went wrong while deleting the payment.'
      );
    }
  };

  // =========================
  // INVOICE INFO
  // =========================

  const getInvoiceNumber = (payment) => {
    if (payment.invoice?.invoiceNumber) {
      return payment.invoice.invoiceNumber;
    }

    const invoiceId =
      payment.invoice?._id ||
      payment.invoice?.id ||
      payment.invoice;

    const invoice = invoices.find(
      (item) =>
        (item._id || item.id) === invoiceId
    );

    return (
      invoice?.invoiceNumber ||
      'Unknown invoice'
    );
  };

  // =========================
  // CLIENT
  // =========================

  const getClientName = (payment) => {
    return (
      payment.invoice?.client?.name ||
      'Unknown client'
    );
  };

  // =========================
  // STATUS CLASS
  // =========================

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'payment-completed';

      case 'Pending':
        return 'payment-pending';

      case 'Failed':
        return 'payment-failed';

      case 'Refunded':
        return 'payment-refunded';

      default:
        return 'payment-pending';
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="payments-page">
        <div className="page-placeholder">
          <p>Loading payments...</p>
        </div>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="payments-page">

      {/* HEADER */}

      <div className="payments-page-header">

        <div>
          <p className="payments-eyebrow">
            Track your income
          </p>

          <h1>Payments</h1>

          <p className="payments-subtitle">
            Record and manage payments received
            from your clients.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={handleAddPayment}
        >
          + Add Payment
        </button>

      </div>

      {/* FORM */}

      {showForm && (
        <div className="panel payment-form-panel">

          <div className="payment-form-header">
            <div>
              <h2>
                {editingPayment
                  ? 'Edit Payment'
                  : 'Add New Payment'}
              </h2>

              <p>
                {editingPayment
                  ? 'Update payment information.'
                  : 'Record a payment received from a client.'}
              </p>
            </div>
          </div>

          <form
            className="payment-form"
            onSubmit={handleSubmit}
          >

            {/* INVOICE */}

            <div className="form-group">
              <label>Invoice</label>

              <select
                name="invoice"
                value={form.invoice}
                onChange={handleChange}
              >
                <option value="">
                  Select an invoice
                </option>

                {invoices.map((invoice) => (
                  <option
                    key={
                      invoice._id ||
                      invoice.id
                    }
                    value={
                      invoice._id ||
                      invoice.id
                    }
                  >
                    {invoice.invoiceNumber}
                    {' — '}
                    {invoice.client?.name ||
                      'Client'}
                  </option>
                ))}
              </select>
            </div>

            {/* AMOUNT */}

            <div className="form-group">
              <label>Amount</label>

              <input
                type="number"
                name="amount"
                min="0"
                value={form.amount}
                onChange={handleChange}
                placeholder="50000"
              />
            </div>

            {/* DATE */}

            <div className="form-group">
              <label>Payment Date</label>

              <input
                type="date"
                name="paymentDate"
                value={form.paymentDate}
                onChange={handleChange}
              />
            </div>

            {/* METHOD */}

            <div className="form-group">
              <label>Payment Method</label>

              <select
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleChange}
              >
                <option value="Bank Transfer">
                  Bank Transfer
                </option>

                <option value="Cash">
                  Cash
                </option>

                <option value="Credit Card">
                  Credit Card
                </option>

                <option value="PayPal">
                  PayPal
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            {/* STATUS */}

            <div className="form-group">
              <label>Status</label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Completed">
                  Completed
                </option>

                <option value="Pending">
                  Pending
                </option>

                <option value="Failed">
                  Failed
                </option>

                <option value="Refunded">
                  Refunded
                </option>
              </select>
            </div>

            {/* NOTES */}

            <div className="form-group full-width">
              <label>Notes</label>

              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Add payment notes..."
                rows="4"
              />
            </div>

            {/* BUTTONS */}

            <div className="form-buttons">

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingPayment
                  ? 'Update Payment'
                  : 'Create Payment'}
              </button>

              <button
                type="button"
                className="cancel-button"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>

            </div>

          </form>
        </div>
      )}

      {/* LIST */}

      <div className="panel payments-list-panel">

        <div className="payments-list-header">

          <div>
            <h2>All Payments</h2>

            <p>
              {payments.length}{' '}
              {payments.length === 1
                ? 'payment'
                : 'payments'}
            </p>
          </div>

          <span className="payment-count">
            {payments.length} Total
          </span>

        </div>

        {payments.length === 0 ? (
          <div className="payments-empty">

            <div className="payments-empty-icon">
              💰
            </div>

            <h3>No payments yet</h3>

            <p>
              Record your first payment to
              start tracking your income.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={handleAddPayment}
            >
              + Add Payment
            </button>

          </div>
        ) : (
          <div className="payments-list">

            {payments.map((payment) => {

              const paymentId =
                payment._id ||
                payment.id;

              return (
                <div
                  className="payment-row"
                  key={paymentId}
                >

                  <div className="payment-icon">
                    $
                  </div>

                  <div className="payment-main-info">

                    <h3>
                      {getInvoiceNumber(payment)}
                    </h3>

                    <p className="payment-client">
                      {getClientName(payment)}
                    </p>

                    <p className="payment-project">
                      {payment.invoice?.project?.title ||
                        'Unknown project'}
                    </p>

                  </div>

                  <div className="payment-meta">

                    <span>Amount</span>

                    <strong>
                      {formatPrice(
                        payment.amount
                      )}
                    </strong>

                  </div>

                  <div className="payment-meta">

                    <span>Payment Date</span>

                    <strong>
                      {formatDate(
                        payment.paymentDate
                      )}
                    </strong>

                  </div>

                  <div className="payment-meta">

                    <span>Method</span>

                    <strong>
                      {payment.paymentMethod ||
                        'Not specified'}
                    </strong>

                  </div>

                  <div className="payment-actions">

                    <span
                      className={`payment-status ${getStatusClass(
                        payment.status
                      )}`}
                    >
                      {payment.status ||
                        'Pending'}
                    </span>

                    <div className="payment-buttons">

                      <button
                        type="button"
                        className="edit-project-button"
                        onClick={() =>
                          handleEdit(payment)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-project-button"
                        onClick={() =>
                          handleDelete(
                            paymentId
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

    </div>
  );
}

export default Payments;