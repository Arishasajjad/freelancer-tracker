import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  company: '',
  notes: ''
};

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  // SEARCH
  const [searchText, setSearchText] = useState('');

  const token = localStorage.getItem('token');

  // =========================================================
  // FETCH CLIENTS
  // =========================================================

  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_URL}/clients`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setClients(data);
      } else {
        console.error(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // =========================================================
  // CREATE / UPDATE CLIENT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `${API_URL}/clients/${editingId}`
        : `${API_URL}/clients`;

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (response.ok) {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(false);

        fetchClients();
      } else {
        alert(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving client:', error);

      alert(
        'Something went wrong while saving the client.'
      );
    }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (client) => {
    setForm({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || '',
      notes: client.notes || ''
    });

    setEditingId(client._id);
    setShowForm(true);
  };

  // =========================================================
  // CANCEL
  // =========================================================

  const handleCancel = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this client?'
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/clients/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        fetchClients();
      } else {
        alert(
          data.message ||
            'Failed to delete client'
        );
      }
    } catch (error) {
      console.error(
        'Error deleting client:',
        error
      );
    }
  };

  // =========================================================
  // SEARCH CLIENTS
  // =========================================================

  const filteredClients = clients.filter((client) => {
    const search = searchText
      .toLowerCase()
      .trim();

    if (!search) {
      return true;
    }

    const name =
      client.name?.toLowerCase() || '';

    return name.includes(search);
  });

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="clients-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="page-header">

        <div>

          <p className="welcome">
            Manage your clients
          </p>

          <h1>
            Clients
          </h1>

        </div>

        <button
          className="primary-button"
          onClick={() => {
            if (showForm) {
              handleCancel();
            } else {
              setForm(emptyForm);
              setEditingId(null);
              setShowForm(true);
            }
          }}
        >
          {showForm
            ? 'Cancel'
            : '+ Add Client'}
        </button>

      </div>

      {/* =====================================================
          ADD / EDIT FORM
      ===================================================== */}

      {showForm && (

        <div className="panel client-form-panel">

          <h2>
            {editingId
              ? 'Edit Client'
              : 'Add New Client'}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="client-form"
          >

            <input
              type="text"
              name="name"
              placeholder="Client name *"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
            />

            <input
              type="text"
              name="company"
              placeholder="Company"
              value={form.company}
              onChange={handleChange}
            />

            <textarea
              name="notes"
              placeholder="Notes"
              value={form.notes}
              onChange={handleChange}
              rows="4"
            />

            <div className="form-buttons">

              <button
                type="submit"
                className="primary-button"
              >
                {editingId
                  ? 'Update Client'
                  : 'Create Client'}
              </button>

              {editingId && (

                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCancel}
                >
                  Cancel
                </button>

              )}

            </div>

          </form>

        </div>

      )}

      {/* =====================================================
          CLIENT LIST
      ===================================================== */}

      <div className="panel">

        {/* PANEL HEADER */}

        <div className="panel-header">

          <div>

            <h2>
              All Clients
            </h2>

            <p>
              Your client list
            </p>

          </div>

          <span className="client-count">
            {filteredClients.length} client
            {filteredClients.length !== 1
              ? 's'
              : ''}
          </span>

        </div>

        {/* =================================================
            SEARCH BAR
        ================================================= */}

        <div className="client-search-container">

          <div className="client-search-box">

            <span className="search-icon">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search clients by name..."
              value={searchText}
              onChange={(e) =>
                setSearchText(
                  e.target.value
                )
              }
            />

            {searchText && (

              <button
                type="button"
                className="clear-search"
                onClick={() =>
                  setSearchText('')
                }
              >
                ×
              </button>

            )}

          </div>

        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (

          <p className="empty-message">
            Loading clients...
          </p>

        ) : filteredClients.length === 0 ? (

          <div className="empty-message">

            {searchText ? (

              <>
                <p>
                  No clients found.
                </p>

                <small>
                  No client matches "
                  {searchText}".
                </small>
              </>

            ) : (

              <p>
                No clients found. Add your
                first client.
              </p>

            )}

          </div>

        ) : (

          /* =================================================
             CLIENTS
          ================================================= */

          <div className="clients-list">

            {filteredClients.map((client) => (

              <div
                className="client-row"
                key={client._id}
              >

                {/* AVATAR */}

                <div className="client-avatar">

                  {client.name
                    ?.charAt(0)
                    .toUpperCase()}

                </div>

                {/* CLIENT INFORMATION */}

                <div className="client-details">

                  <h3>
                    {client.name}
                  </h3>

                  <p>
                    {client.company ||
                      'No company'}
                  </p>

                  <small>
                    {client.email ||
                      'No email'}
                  </small>

                </div>

                {/* PHONE */}

                <div className="client-contact">

                  <span>
                    {client.phone ||
                      'No phone'}
                  </span>

                </div>

                {/* ACTIONS */}

                <div className="client-actions">

                  {/* VIEW DETAILS */}

                  <Link
                    to={`/clients/${client._id}`}
                    className="view-details-button"
                  >
                    View Details
                  </Link>

                  {/* EDIT */}

                  <button
                    type="button"
                    className="edit-button"
                    onClick={() =>
                      handleEdit(client)
                    }
                  >
                    Edit
                  </button>

                  {/* DELETE */}

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() =>
                      handleDelete(
                        client._id
                      )
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default Clients;