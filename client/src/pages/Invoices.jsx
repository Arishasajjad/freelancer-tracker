import { useEffect, useState } from 'react';

const API_URL = 'https://freelancer-tracker-pn21.onrender.com/api';
const emptyForm = {
  client: '',
  project: '',
  invoiceNumber: '',
  issueDate: '',
  dueDate: '',
  amount: '',
  status: 'Draft',
  notes: ''
};

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  const [form, setForm] = useState(emptyForm);

  const token = localStorage.getItem('token');

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

    return [
      parsed.getFullYear(),
      String(parsed.getMonth() + 1).padStart(2, '0'),
      String(parsed.getDate()).padStart(2, '0')
    ].join('-');
  };

  const formatDate = (date) => {
    const cleanDate = getInputDate(date);

    if (!cleanDate) {
      return 'No date';
    }

    const [year, month, day] = cleanDate.split('-');

    return `${day}/${month}/${year}`;
  };

  const formatPrice = (amount) => {
    return `PKR ${Number(amount || 0).toLocaleString()}`;
  };

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`${API_URL}/invoices`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

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
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_URL}/clients`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        if (Array.isArray(data)) {
          setClients(data);
        } else if (Array.isArray(data.clients)) {
          setClients(data.clients);
        } else if (Array.isArray(data.data)) {
          setClients(data.data);
        } else {
          setClients([]);
        }
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_URL}/projects`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        if (Array.isArray(data)) {
          setProjects(data);
        } else if (Array.isArray(data.projects)) {
          setProjects(data.projects);
        } else if (Array.isArray(data.data)) {
          setProjects(data.data);
        } else {
          setProjects([]);
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        fetchInvoices(),
        fetchClients(),
        fetchProjects()
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleAddInvoice = () => {
    setEditingInvoice(null);

    setForm({
      ...emptyForm,
      issueDate: getInputDate(new Date())
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);

    setForm({
      client:
        invoice.client?._id ||
        invoice.client?.id ||
        invoice.client ||
        '',

      project:
        invoice.project?._id ||
        invoice.project?.id ||
        invoice.project ||
        '',

      invoiceNumber: invoice.invoiceNumber || '',
      issueDate: getInputDate(invoice.issueDate),
      dueDate: getInputDate(invoice.dueDate),

      amount:
        invoice.amount !== undefined &&
        invoice.amount !== null
          ? String(invoice.amount)
          : '',

      status: invoice.status || 'Draft',
      notes: invoice.notes || ''
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingInvoice(null);
    setForm({ ...emptyForm });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.client) {
      alert('Please select a client.');
      return;
    }

    if (!form.project) {
      alert('Please select a project.');
      return;
    }

    if (!form.invoiceNumber.trim()) {
      alert('Invoice number is required.');
      return;
    }

    if (!form.issueDate) {
      alert('Issue date is required.');
      return;
    }

    if (!form.dueDate) {
      alert('Due date is required.');
      return;
    }

    if (form.amount === '' || Number(form.amount) < 0) {
      alert('Enter a valid invoice amount.');
      return;
    }

    setSaving(true);

    try {
      const invoiceData = {
        client: form.client,
        project: form.project,
        invoiceNumber: form.invoiceNumber.trim(),
        issueDate: `${form.issueDate}T00:00:00.000Z`,
        dueDate: `${form.dueDate}T00:00:00.000Z`,
        amount: Number(form.amount),
        status: form.status,
        notes: form.notes.trim()
      };

      const invoiceId =
        editingInvoice?._id ||
        editingInvoice?.id;

      const response = await fetch(
        editingInvoice
          ? `${API_URL}/invoices/${invoiceId}`
          : `${API_URL}/invoices`,
        {
          method: editingInvoice ? 'PUT' : 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify(invoiceData)
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(
          editingInvoice
            ? 'Invoice updated successfully!'
            : 'Invoice created successfully!'
        );

        handleCancel();
        await fetchInvoices();
      } else {
        alert(data.message || 'Failed to save invoice.');
      }
    } catch (error) {
      console.error('Invoice save error:', error);
      alert('Something went wrong while saving the invoice.');
    } finally {
      setSaving(false);
    }
  };

const escapeHtml = (value) => {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const handlePrintInvoice = (invoice) => {
  const printWindow = window.open(
    '',
    '_blank',
    'width=900,height=700'
  );

  if (!printWindow) {
    alert(
      'Please allow pop-ups in your browser to print the invoice.'
    );
    return;
  }

  const clientName =
    invoice.client?.name ||
    'Unknown client';

  const clientEmail =
    invoice.client?.email ||
    'No email';

  const projectTitle =
    invoice.project?.title ||
    'Unknown project';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${escapeHtml(invoice.invoiceNumber)}</title>

        <style>
          @page {
            size: A4;
            margin: 20mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            color: #1f2937;
            font-family: Arial, sans-serif;
          }

          .invoice {
            max-width: 800px;
            margin: 0 auto;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-bottom: 25px;
            border-bottom: 2px solid #635bff;
          }

          .brand h1 {
            margin: 0 0 5px;
            color: #635bff;
            font-size: 28px;
          }

          .brand p {
            margin: 0;
            color: #6b7280;
            font-size: 14px;
          }

          .invoice-title {
            text-align: right;
          }

          .invoice-title h2 {
            margin: 0 0 8px;
            font-size: 25px;
          }

          .invoice-title p {
            margin: 4px 0;
            color: #4b5563;
            font-size: 14px;
          }

          .details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 35px 0;
          }

          .details h3 {
            margin: 0 0 12px;
            color: #635bff;
            font-size: 14px;
            text-transform: uppercase;
          }

          .details p {
            margin: 7px 0;
            font-size: 14px;
          }

          .amount-box {
            margin-top: 25px;
            padding: 22px;
            border-radius: 12px;
            background: #f4f3ff;
            text-align: right;
          }

          .amount-box span {
            color: #6b7280;
            font-size: 14px;
          }

          .amount-box strong {
            display: block;
            margin-top: 6px;
            color: #635bff;
            font-size: 28px;
          }

          .notes {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }

          .notes h3 {
            margin: 0 0 8px;
            font-size: 14px;
          }

          .notes p {
            margin: 0;
            color: #4b5563;
            font-size: 14px;
            line-height: 1.6;
          }

          .footer {
            margin-top: 55px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            color: #9ca3af;
            font-size: 12px;
            text-align: center;
          }
        </style>
      </head>

      <body>
        <main class="invoice">
          <section class="header">
            <div class="brand">
              <h1>Freelancer Tracker</h1>
              <p>Professional Invoice</p>
            </div>

            <div class="invoice-title">
              <h2>INVOICE</h2>
              <p><strong>${escapeHtml(invoice.invoiceNumber)}</strong></p>
              <p>Status: ${escapeHtml(invoice.status || 'Draft')}</p>
            </div>
          </section>

          <section class="details">
            <div>
              <h3>Billed To</h3>
              <p><strong>${escapeHtml(clientName)}</strong></p>
              <p>${escapeHtml(clientEmail)}</p>
            </div>

            <div>
              <h3>Invoice Details</h3>
              <p>Project: ${escapeHtml(projectTitle)}</p>
              <p>Issue Date: ${escapeHtml(formatDate(invoice.issueDate))}</p>
              <p>Due Date: ${escapeHtml(formatDate(invoice.dueDate))}</p>
            </div>
          </section>

          <section class="amount-box">
            <span>Total Amount</span>
            <strong>${escapeHtml(
              formatPrice(invoice.amount ?? invoice.total)
            )}</strong>
          </section>

          ${
            invoice.notes
              ? `
                <section class="notes">
                  <h3>Notes</h3>
                  <p>${escapeHtml(invoice.notes)}</p>
                </section>
              `
              : ''
          }

          <footer class="footer">
            Thank you for your business.
          </footer>
        </main>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
  }, 300);
};

  const handleDelete = async (invoiceId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this invoice?'
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/invoices/${invoiceId}`,
        {
          method: 'DELETE',

          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert('Invoice deleted successfully!');

        setInvoices((previous) =>
          previous.filter(
            (invoice) =>
              (invoice._id || invoice.id) !== invoiceId
          )
        );
      } else {
        alert(data.message || 'Failed to delete invoice.');
      }
    } catch (error) {
      console.error('Delete invoice error:', error);
      alert('Something went wrong while deleting the invoice.');
    }
  };

  // Draft and Sent invoices are treated as unpaid.
  const displayedInvoices = invoices.filter((invoice) => {
    if (statusFilter === 'All') {
      return true;
    }

    if (statusFilter === 'Unpaid') {
      return (
        invoice.status === 'Draft' ||
        invoice.status === 'Sent'
      );
    }

    return invoice.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="invoices-page">
        <div className="page-placeholder">
          <p>Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="invoices-page">
      <div className="invoices-page-header">
        <div>
          <p className="invoices-eyebrow">
            Manage your billing
          </p>

          <h1>Invoices</h1>

          <p className="invoices-subtitle">
            Create, track and manage invoices
            for your freelance projects.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={handleAddInvoice}
        >
          + Create Invoice
        </button>
      </div>

      {showForm && (
        <div className="panel invoice-form-panel">
          <div className="invoice-form-header">
            <div>
              <h2>
                {editingInvoice
                  ? 'Edit Invoice'
                  : 'Create New Invoice'}
              </h2>

              <p>
                {editingInvoice
                  ? 'Update your invoice information.'
                  : 'Create an invoice for one of your projects.'}
              </p>
            </div>
          </div>

          <form
            className="invoice-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label>Client</label>

              <select
                name="client"
                value={form.client}
                onChange={handleChange}
              >
                <option value="">
                  Select a client
                </option>

                {clients.map((client) => (
                  <option
                    key={client._id || client.id}
                    value={client._id || client.id}
                  >
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Project</label>

              <select
                name="project"
                value={form.project}
                onChange={handleChange}
              >
                <option value="">
                  Select a project
                </option>

                {projects.map((project) => (
                  <option
                    key={project._id || project.id}
                    value={project._id || project.id}
                  >
                    {project.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Invoice Number</label>

              <input
                type="text"
                name="invoiceNumber"
                value={form.invoiceNumber}
                onChange={handleChange}
                placeholder="INV-003"
              />
            </div>

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

            <div className="form-group">
              <label>Issue Date</label>

              <input
                type="date"
                name="issueDate"
                value={form.issueDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Due Date</label>

              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Status</label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Notes</label>

              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Add any notes about this invoice..."
                rows="4"
              />
            </div>

            <div className="form-buttons">
              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingInvoice
                  ? 'Update Invoice'
                  : 'Create Invoice'}
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

      <div className="panel invoices-list-panel">
        <div className="invoices-list-header">
          <div>
            <h2>All Invoices</h2>

            <p>
              {displayedInvoices.length}{' '}
              {displayedInvoices.length === 1
                ? 'invoice'
                : 'invoices'}
            </p>
          </div>

          <span className="invoice-count">
            {invoices.length} Total
          </span>
        </div>

        <div className="invoice-filter-bar">
          <label htmlFor="invoice-status-filter">
            Filter by status
          </label>

          <select
            id="invoice-status-filter"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="All">All Invoices</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        {invoices.length === 0 ? (
          <div className="invoices-empty">
            <div className="invoices-empty-icon">
              📄
            </div>

            <h3>No invoices yet</h3>

            <p>
              Create your first invoice
              to start managing your billing.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={handleAddInvoice}
            >
              + Create Invoice
            </button>
          </div>
        ) : displayedInvoices.length === 0 ? (
          <div className="invoices-empty">
            <div className="invoices-empty-icon">
              🔎
            </div>

            <h3>No matching invoices</h3>

            <p>
              No invoices match this status filter.
            </p>

            <button
              type="button"
              className="cancel-button"
              onClick={() => setStatusFilter('All')}
            >
              Clear Filter
            </button>
          </div>
        ) : (
          <div className="invoices-list">
            {displayedInvoices.map((invoice) => {
              const invoiceId =
                invoice._id ||
                invoice.id;

              return (
                <div
                  className="invoice-card"
                  key={invoiceId}
                >
                  <div className="invoice-card-top">
                    <div className="invoice-number-area">
                      <div className="invoice-icon">
                        📄
                      </div>

                      <div>
                        <h3>
                          {invoice.invoiceNumber}
                        </h3>

                        <p>
                          Issued{' '}
                          {formatDate(invoice.issueDate)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`invoice-status invoice-status-${(
                        invoice.status || 'Draft'
                      )
                        .toLowerCase()
                        .replace(/\s+/g, '-')}`}
                    >
                      {invoice.status || 'Draft'}
                    </span>
                  </div>

                  <div className="invoice-details-grid">
                    <div className="invoice-detail">
                      <span>Client</span>

                      <strong>
                        {invoice.client?.name ||
                          'Unknown client'}
                      </strong>

                      {invoice.client?.email && (
                        <small>
                          {invoice.client.email}
                        </small>
                      )}
                    </div>

                    <div className="invoice-detail">
                      <span>Project</span>

                      <strong>
                        {invoice.project?.title ||
                          'Unknown project'}
                      </strong>
                    </div>

                    <div className="invoice-detail">
                      <span>Due Date</span>

                      <strong>
                        {formatDate(invoice.dueDate)}
                      </strong>
                    </div>

                    <div className="invoice-detail invoice-amount">
                      <span>Amount</span>

                      <strong>
                        {formatPrice(
                          invoice.amount ??
                          invoice.total
                        )}
                      </strong>
                    </div>
                  </div>

                  {invoice.notes && (
                    <div className="invoice-notes">
                      <span>Notes</span>
                      <p>{invoice.notes}</p>
                    </div>
                  )}

                  <div className="invoice-card-actions">

                    <button
                    type="button"
                    className="print-invoice-button"
                     onClick={() => handlePrintInvoice(invoice)}
                    >
                    Print / Save PDF
                      </button>

                    <button
                      type="button"
                      className="edit-project-button"
                      onClick={() => handleEdit(invoice)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-project-button"
                      onClick={() =>
                        handleDelete(invoiceId)
                      }
                    >
                      Delete
                    </button>
                   
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

export default Invoices;