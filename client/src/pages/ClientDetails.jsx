import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = 'https://freelancer-tracker-pn21.onrender.com/api';
const SERVER_URL = 'https://freelancer-tracker-pn21.onrender.com';

function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const token = localStorage.getItem('token');

  // =========================================================
  // FETCH CLIENT
  // =========================================================

  const fetchClient = async () => {
    try {
      const response = await fetch(`${API_URL}/clients/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setClient(data.client || data);
      } else {
        console.error('Failed to fetch client:', data);
      }
    } catch (error) {
      console.error('Error fetching client:', error);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH PROJECTS + INVOICES
  // =========================================================

  const fetchClientRelatedData = async () => {
    try {
      setRelatedLoading(true);

      const [projectsResponse, invoicesResponse] = await Promise.all([
        fetch(`${API_URL}/projects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        fetch(`${API_URL}/invoices`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      // -------------------------
      // PROJECTS
      // -------------------------

      const projectsData = await projectsResponse.json();

      if (projectsResponse.ok) {
        const projectList = Array.isArray(projectsData)
          ? projectsData
          : projectsData.projects || [];

        const clientProjects = projectList.filter((project) => {
          const projectClientId =
            typeof project.client === 'object'
              ? project.client?._id
              : project.client;

          return projectClientId === id;
        });

        setProjects(clientProjects);
      } else {
        console.error('Failed to fetch projects:', projectsData);
        setProjects([]);
      }

      // -------------------------
      // INVOICES
      // -------------------------

      const invoicesData = await invoicesResponse.json();

      if (invoicesResponse.ok) {
        const invoiceList = Array.isArray(invoicesData)
          ? invoicesData
          : invoicesData.invoices || [];

        const clientInvoices = invoiceList.filter((invoice) => {
          const invoiceClientId =
            typeof invoice.client === 'object'
              ? invoice.client?._id
              : invoice.client;

          return invoiceClientId === id;
        });

        setInvoices(clientInvoices);
      } else {
        console.error('Failed to fetch invoices:', invoicesData);
        setInvoices([]);
      }
    } catch (error) {
      console.error('Error fetching projects/invoices:', error);

      setProjects([]);
      setInvoices([]);
    } finally {
      setRelatedLoading(false);
    }
  };

  // =========================================================
  // FETCH DOCUMENTS
  // =========================================================

  const fetchDocuments = async () => {
    try {
      setDocumentsLoading(true);

      const response = await fetch(
        `${API_URL}/documents/client/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (Array.isArray(data)) {
          setDocuments(data);
        } else if (Array.isArray(data.documents)) {
          setDocuments(data.documents);
        } else if (Array.isArray(data.data)) {
          setDocuments(data.data);
        } else {
          setDocuments([]);
        }
      } else {
        console.error('Failed to fetch documents:', data);
        setDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  // =========================================================
  // LOAD EVERYTHING
  // =========================================================

  useEffect(() => {
    if (!id || !token) return;

    fetchClient();
    fetchClientRelatedData();
    fetchDocuments();
  }, [id, token]);

  // =========================================================
  // ATTACH FILE
  // =========================================================

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  // =========================================================
  // UPLOAD FILE
  // =========================================================

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();

      formData.append('file', file);

      const response = await fetch(
        `${API_URL}/documents/client/${id}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert('File uploaded successfully!');
        await fetchDocuments();
      } else {
        alert(data.message || 'File upload failed.');
      }
    } catch (error) {
      console.error('Upload error:', error);

      alert('Something went wrong while uploading the file.');
    } finally {
      setUploading(false);

      e.target.value = '';
    }
  };

  // =========================================================
  // DELETE DOCUMENT
  // =========================================================

  const handleDeleteDocument = async (documentId) => {
    if (!documentId) {
      alert('Document ID not found.');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this file?'
    );

    if (!confirmed) return;

    setDeletingId(documentId);

    try {
      const response = await fetch(
        `${API_URL}/documents/${documentId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setDocuments((currentDocuments) =>
          currentDocuments.filter(
            (document) =>
              document._id !== documentId &&
              document.id !== documentId
          )
        );

        alert('File deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete file.');
      }
    } catch (error) {
      console.error('Delete error:', error);

      alert('Something went wrong while deleting the file.');
    } finally {
      setDeletingId(null);
    }
  };

  // =========================================================
  // FILE URL
  // =========================================================

  const getFileUrl = (document) => {
    const possiblePath =
      document.url ||
      document.fileUrl ||
      document.path ||
      document.filePath ||
      document.filename ||
      document.fileName;

    if (!possiblePath) {
      return null;
    }

    if (
      possiblePath.startsWith('http://') ||
      possiblePath.startsWith('https://')
    ) {
      return possiblePath;
    }

    let cleanPath = possiblePath.replace(/\\/g, '/');

    cleanPath = cleanPath.replace(/^\.?\//, '');

    if (cleanPath.startsWith('uploads/')) {
      return `${SERVER_URL}/${cleanPath}`;
    }

    return `${SERVER_URL}/uploads/${cleanPath}`;
  };

  // =========================================================
  // DOCUMENT NAME
  // =========================================================

  const getDocumentName = (document) => {
    return (
      document.originalName ||
      document.originalname ||
      document.fileName ||
      document.filename ||
      document.name ||
      'Uploaded file'
    );
  };

  // =========================================================
  // CHECK IMAGE
  // =========================================================

  const isImage = (document) => {
    const name = getDocumentName(document).toLowerCase();

    return (
      name.endsWith('.jpg') ||
      name.endsWith('.jpeg') ||
      name.endsWith('.png') ||
      name.endsWith('.gif') ||
      name.endsWith('.webp')
    );
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) return 'N/A';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'N/A';
    }

    return parsedDate.toLocaleDateString();
  };

  // =========================================================
  // FORMAT MONEY
  // =========================================================

  const formatMoney = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString()}`;
  };

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalEarnings = invoices
    .filter(
      (invoice) =>
        invoice.status?.toLowerCase() === 'paid'
    )
    .reduce(
      (total, invoice) =>
        total + Number(invoice.amount || 0),
      0
    );

  const outstandingInvoices = invoices
    .filter(
      (invoice) =>
        invoice.status?.toLowerCase() !== 'paid'
    )
    .reduce(
      (total, invoice) =>
        total + Number(invoice.amount || 0),
      0
    );

  const completedProjects = projects.filter(
    (project) =>
      project.status?.toLowerCase() === 'completed'
  ).length;

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="clients-page">
        <p className="empty-message">
          Loading client...
        </p>
      </div>
    );
  }

  // =========================================================
  // CLIENT NOT FOUND
  // =========================================================

  if (!client) {
    return (
      <div className="clients-page">
        <p className="empty-message">
          Client not found.
        </p>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="clients-page">

      {/* BACK BUTTON */}

      <button
        type="button"
        className="back-button"
        onClick={() => navigate('/clients')}
      >
        ← Back to Clients
      </button>

      {/* CLIENT HEADER */}

      <div className="client-details-header">

        <div className="client-big-avatar">
          {client.name?.charAt(0).toUpperCase()}
        </div>

        <div>
          <h1>{client.name}</h1>

          <p>
            {client.company || 'No company'}
          </p>
        </div>

      </div>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="client-stats-grid">

        <div className="client-stat-card">
          <span className="stat-label">
            Total Earnings
          </span>

          <strong className="stat-value">
            {relatedLoading
              ? '...'
              : formatMoney(totalEarnings)}
          </strong>

          <small>
            From paid invoices
          </small>
        </div>

        <div className="client-stat-card">
          <span className="stat-label">
            Outstanding
          </span>

          <strong className="stat-value">
            {relatedLoading
              ? '...'
              : formatMoney(outstandingInvoices)}
          </strong>

          <small>
            Unpaid invoices
          </small>
        </div>

        <div className="client-stat-card">
          <span className="stat-label">
            Completed Projects
          </span>

          <strong className="stat-value">
            {relatedLoading
              ? '...'
              : completedProjects}
          </strong>

          <small>
            Finished projects
          </small>
        </div>

        <div className="client-stat-card">
          <span className="stat-label">
            Total Projects
          </span>

          <strong className="stat-value">
            {relatedLoading
              ? '...'
              : projects.length}
          </strong>

          <small>
            All projects
          </small>
        </div>

      </div>

      {/* =====================================================
          CONTACT INFORMATION + NOTES
      ===================================================== */}

      <div className="client-info-grid">

        <div className="panel">

          <h2>Contact Information</h2>

          <div className="info-row">
            <span>Email</span>

            <strong>
              {client.email || 'No email'}
            </strong>
          </div>

          <div className="info-row">
            <span>Phone</span>

            <strong>
              {client.phone || 'No phone'}
            </strong>
          </div>

          <div className="info-row">
            <span>Company</span>

            <strong>
              {client.company || 'No company'}
            </strong>
          </div>

        </div>

        <div className="panel">

          <h2>Notes</h2>

          <p className="notes-text">
            {client.notes || 'No notes available.'}
          </p>

        </div>

      </div>

      {/* =====================================================
          PROJECTS
      ===================================================== */}

      <div className="panel">

        <div className="panel-header">

          <div>
            <h2>Projects</h2>

            <p>
              Projects associated with this client
            </p>
          </div>

          <span className="client-count">
            {projects.length} project
            {projects.length !== 1 ? 's' : ''}
          </span>

        </div>

        {relatedLoading ? (

          <p className="empty-message">
            Loading projects...
          </p>

        ) : projects.length === 0 ? (

          <p className="empty-message">
            No projects found for this client.
          </p>

        ) : (

          <div className="client-projects-list">
  {projects.map((project) => (
    <div
      className="client-project-row clickable-project"
      key={project._id}
      onClick={() => navigate(`/projects/${project._id}`)}
    >
      <div>
        <h3>
          {project.title}
        </h3>

        <p>
          {project.description || 'No description'}
        </p>
      </div>

      <div className="project-info">
        <span>Status</span>
        <strong>
          {project.status || 'Planning'}
        </strong>
      </div>

      <div className="project-info">
        <span>Deadline</span>
        <strong>
          {project.deadline
            ? formatDate(project.deadline)
            : 'No deadline'}
        </strong>
      </div>

      <div className="project-info">
        <span>Price</span>
        <strong>
          {formatMoney(project.price)}
        </strong>
      </div>
    </div>
  ))}
</div>

        )}

      </div>

      {/* =====================================================
          INVOICES
      ===================================================== */}

      <div className="panel">

        <div className="panel-header">

          <div>
            <h2>Invoices</h2>

            <p>
              Invoices associated with this client
            </p>
          </div>

          <span className="client-count">
            {invoices.length} invoice
            {invoices.length !== 1 ? 's' : ''}
          </span>

        </div>

        {relatedLoading ? (

          <p className="empty-message">
            Loading invoices...
          </p>

        ) : invoices.length === 0 ? (

          <p className="empty-message">
            No invoices found for this client.
          </p>

        ) : (

          <div className="client-invoices-list">

            {invoices.map((invoice) => (

              <div
                className="client-invoice-row"
                key={invoice._id}
              >

                <div>
                  <h3>
                    {invoice.invoiceNumber}
                  </h3>

                  <p>
                    {invoice.project?.title ||
                      'No project'}
                  </p>
                </div>

                <div className="invoice-info">
                  <span>Issue Date</span>

                  <strong>
                    {formatDate(invoice.issueDate)}
                  </strong>
                </div>

                <div className="invoice-info">
                  <span>Due Date</span>

                  <strong>
                    {formatDate(invoice.dueDate)}
                  </strong>
                </div>

                <div className="invoice-info">
                  <span>Amount</span>

                  <strong>
                    {formatMoney(invoice.amount)}
                  </strong>
                </div>

                <div>
                  <span
                    className={`invoice-status status-${invoice.status
                      ?.toLowerCase()
                      .replace(/\s+/g, '-')}`}
                  >
                    {invoice.status || 'Draft'}
                  </span>
                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* =====================================================
          DOCUMENTS
      ===================================================== */}

      <div className="panel documents-panel">

        <div className="panel-header">

          <div>
            <h2>
              Documents & Images
            </h2>

            <p>
              Attach files related to this client
            </p>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={handleAttachClick}
            disabled={uploading}
          >
            {uploading
              ? 'Uploading...'
              : '+ Attach File'}
          </button>

        </div>

        {/* HIDDEN FILE INPUT */}

        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* DOCUMENTS */}

        {documentsLoading ? (

          <div className="documents-empty">
            <p>
              Loading documents...
            </p>
          </div>

        ) : documents.length === 0 ? (

          <div className="documents-empty">

            <p>
              No files attached to this client yet.
            </p>

            <small>
              Select an image or document to upload.
            </small>

            <small>
              Supported: JPG, PNG, GIF, WEBP, PDF,
              DOC, DOCX, XLS, XLSX, TXT
            </small>

          </div>

        ) : (

          <div className="documents-list">

            {documents.map((document, index) => {

              const fileUrl = getFileUrl(document);

              const fileName =
                getDocumentName(document);

              const documentId =
                document._id || document.id;

              const isDeleting =
                deletingId === documentId;

              return (

                <div
                  className="document-item"
                  key={documentId || index}
                >

                  {/* PREVIEW */}

                  <div className="document-preview">

                    {isImage(document) && fileUrl ? (

                      <img
                        src={fileUrl}
                        alt={fileName}
                        className="document-image"
                      />

                    ) : (

                      <div className="document-icon">
                        📄
                      </div>

                    )}

                  </div>

                  {/* INFORMATION */}

                  <div className="document-info">

                    <h3>
                      {fileName}
                    </h3>

                    <small>
                      {document.createdAt
                        ? `Uploaded ${formatDate(
                            document.createdAt
                          )}`
                        : 'Uploaded file'}
                    </small>

                  </div>

                  {/* ACTIONS */}

                  <div className="document-actions">

                    {fileUrl && (

                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="edit-button"
                      >
                        Open
                      </a>

                    )}

                    <button
                      type="button"
                      className="delete-button"
                      onClick={() =>
                        handleDeleteDocument(documentId)
                      }
                      disabled={isDeleting}
                    >
                      {isDeleting
                        ? 'Deleting...'
                        : 'Delete'}
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

export default ClientDetails;