import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://freelancer-tracker-pn21.onrender.com/api';
const emptyForm = {
  title: '',
  client: '',
  description: '',
  status: 'Planning',
  deadline: '',
  price: ''
};

function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [form, setForm] = useState(emptyForm);

  // =========================================================
  // SEARCH / FILTER / SORT
  // =========================================================

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('None');

  const token = localStorage.getItem('token');

  // =========================================================
  // NORMALIZE DATE FOR INPUT
  // =========================================================

  const getInputDate = (date) => {
    if (!date) {
      return '';
    }

    // Already YYYY-MM-DD
    if (
      typeof date === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      return date;
    }

    // ISO date
    if (typeof date === 'string') {
      const match = date.match(
        /^(\d{4}-\d{2}-\d{2})/
      );

      if (match) {
        return match[1];
      }
    }

    try {
      const parsed = new Date(date);

      if (Number.isNaN(parsed.getTime())) {
        return '';
      }

      const year = parsed.getFullYear();

      const month = String(
        parsed.getMonth() + 1
      ).padStart(2, '0');

      const day = String(
        parsed.getDate()
      ).padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  // =========================================================
  // FETCH PROJECTS
  // =========================================================

  const fetchProjects = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/projects`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      console.log(
        'Projects response:',
        data
      );

      if (response.ok) {
        if (Array.isArray(data)) {
          setProjects(data);
        } else if (
          Array.isArray(data.projects)
        ) {
          setProjects(data.projects);
        } else if (
          Array.isArray(data.data)
        ) {
          setProjects(data.data);
        } else {
          setProjects([]);
        }
      } else {
        console.error(data);
        setProjects([]);
      }
    } catch (error) {
      console.error(
        'Error fetching projects:',
        error
      );

      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH CLIENTS
  // =========================================================

  const fetchClients = async () => {
    try {
      const response = await fetch(
        `${API_URL}/clients`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      console.log(
        'Clients response:',
        data
      );

      if (response.ok) {
        if (Array.isArray(data)) {
          setClients(data);
        } else if (
          Array.isArray(data.clients)
        ) {
          setClients(data.clients);
        } else if (
          Array.isArray(data.data)
        ) {
          setClients(data.data);
        } else {
          setClients([]);
        }
      } else {
        console.error(data);
        setClients([]);
      }
    } catch (error) {
      console.error(
        'Error fetching clients:',
        error
      );

      setClients([]);
    }
  };

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetchProjects();
    fetchClients();
  }, []);

  // =========================================================
  // HANDLE FORM INPUT
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // =========================================================
  // OPEN ADD FORM
  // =========================================================

  const handleAddProject = () => {
    setEditingProject(null);

    setForm({
      ...emptyForm
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // =========================================================
  // OPEN EDIT FORM
  // =========================================================

  const handleEdit = (project) => {
    setEditingProject(project);

    setForm({
      title: project.title || '',

      client:
        project.client?._id ||
        project.client?.id ||
        project.client ||
        '',

      description:
        project.description || '',

      status:
        project.status || 'Planning',

      deadline:
        getInputDate(
          project.deadline
        ),

      price:
        project.price !== undefined &&
        project.price !== null
          ? project.price
          : ''
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // =========================================================
  // CANCEL FORM
  // =========================================================

  const handleCancel = () => {
    setShowForm(false);
    setEditingProject(null);

    setForm({
      ...emptyForm
    });
  };

  // =========================================================
  // CREATE / UPDATE PROJECT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert(
        'Project title is required.'
      );
      return;
    }

    if (!form.client) {
      alert(
        'Please select a client.'
      );
      return;
    }

    if (form.price === '') {
      alert(
        'Project price is required.'
      );
      return;
    }

    setSaving(true);

    try {
      const projectData = {
        title: form.title.trim(),

        client: form.client,

        description:
          form.description.trim(),

        status: form.status,

        deadline: form.deadline
          ? `${form.deadline}T00:00:00.000Z`
          : null,

        price: Number(form.price)
      };

      console.log(
        'Sending project data:',
        projectData
      );

      let response;

      // =====================================================
      // UPDATE
      // =====================================================

      if (editingProject) {
        const projectId =
          editingProject._id ||
          editingProject.id;

        response = await fetch(
          `${API_URL}/projects/${projectId}`,
          {
            method: 'PUT',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${token}`
            },

            body:
              JSON.stringify(
                projectData
              )
          }
        );
      }

      // =====================================================
      // CREATE
      // =====================================================

      else {
        response = await fetch(
          `${API_URL}/projects`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${token}`
            },

            body:
              JSON.stringify(
                projectData
              )
          }
        );
      }

      const data =
        await response.json();

      console.log(
        'Project save response:',
        data
      );

      if (response.ok) {
        alert(
          editingProject
            ? 'Project updated successfully!'
            : 'Project created successfully!'
        );

        handleCancel();

        await fetchProjects();
      } else {
        console.error(data);

        alert(
          data.message ||
            (
              editingProject
                ? 'Failed to update project.'
                : 'Failed to create project.'
            )
        );
      }
    } catch (error) {
      console.error(
        'Project save error:',
        error
      );

      alert(
        'Something went wrong while saving the project.'
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE PROJECT
  // =========================================================

  const handleDelete = async (
    projectId
  ) => {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this project?'
      );

    if (!confirmed) {
      return;
    }

    try {
      const response =
        await fetch(
          `${API_URL}/projects/${projectId}`,
          {
            method: 'DELETE',

            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const data =
        await response.json();

      console.log(
        'Delete response:',
        data
      );

      if (response.ok) {
        alert(
          'Project deleted successfully!'
        );

        setProjects(
          (previous) =>
            previous.filter(
              (project) =>
                (
                  project._id ||
                  project.id
                ) !== projectId
            )
        );
      } else {
        alert(
          data.message ||
            'Failed to delete project.'
        );
      }
    } catch (error) {
      console.error(
        'Delete project error:',
        error
      );

      alert(
        'Something went wrong while deleting the project.'
      );
    }
  };

  // =========================================================
  // FORMAT PRICE
  // =========================================================

  const formatPrice = (price) => {
    const number =
      Number(price || 0);

    return `PKR ${number.toLocaleString()}`;
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return 'No deadline';
    }

    const cleanDate =
      getInputDate(date);

    if (!cleanDate) {
      return 'No deadline';
    }

    const [
      year,
      month,
      day
    ] = cleanDate.split('-');

    return `${day}/${month}/${year}`;
  };

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (
    status
  ) => {
    switch (status) {
      case 'Planning':
        return 'planning';

      case 'In Progress':
        return 'in-progress';

      case 'Completed':
        return 'completed';

      case 'On Hold':
        return 'on-hold';

      default:
        return 'planning';
    }
  };

  // =========================================================
  // GET CLIENT NAME
  // =========================================================

  const getClientName = (
    project
  ) => {
    if (project.client?.name) {
      return project.client.name;
    }

    const client =
      clients.find(
        (item) =>
          (item._id ||
            item.id) ===
          (
            project.client?._id ||
            project.client?.id ||
            project.client
          )
      );

    return (
      client?.name ||
      'Unknown client'
    );
  };

  // =========================================================
  // SEARCH + FILTER + SORT
  // =========================================================

  const displayedProjects =
    [...projects]
      .filter((project) => {
        const search =
          searchTerm
            .toLowerCase()
            .trim();

        if (!search) {
          return true;
        }

        const title =
          project.title
            ?.toLowerCase() ||
          '';

        const clientName =
          getClientName(project)
            .toLowerCase();

        return (
          title.includes(search) ||
          clientName.includes(search)
        );
      })

      .filter((project) => {
        if (
          statusFilter === 'All'
        ) {
          return true;
        }

        return (
          project.status ===
          statusFilter
        );
      })

      .sort((a, b) => {
        if (
          sortBy ===
          'Deadline Ascending'
        ) {
          if (!a.deadline) {
            return 1;
          }

          if (!b.deadline) {
            return -1;
          }

          return (
            new Date(a.deadline) -
            new Date(b.deadline)
          );
        }

        if (
          sortBy ===
          'Deadline Descending'
        ) {
          if (!a.deadline) {
            return 1;
          }

          if (!b.deadline) {
            return -1;
          }

          return (
            new Date(b.deadline) -
            new Date(a.deadline)
          );
        }

        return 0;
      });

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setSortBy('None');
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="projects-page">

        <div className="page-placeholder">

          <p>
            Loading projects...
          </p>

        </div>

      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="projects-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="projects-page-header">

        <div>

          <p className="projects-eyebrow">
            Manage your freelance work
          </p>

          <h1>
            Projects
          </h1>

          <p className="projects-subtitle">
            Create and manage projects
            for your clients.
          </p>

        </div>

        <button
          type="button"
          className="primary-button"
          onClick={
            handleAddProject
          }
        >
          + Add Project
        </button>

      </div>


      {/* =====================================================
          ADD / EDIT FORM
      ===================================================== */}

      {showForm && (
        <div className="panel project-form-panel">

          <div className="project-form-header">

            <div>

              <h2>
                {editingProject
                  ? 'Edit Project'
                  : 'Add New Project'}
              </h2>

              <p>
                {editingProject
                  ? 'Update your project information.'
                  : 'Enter the details for your new project.'}
              </p>

            </div>

          </div>


          <form
            className="project-form"
            onSubmit={
              handleSubmit
            }
          >

            {/* TITLE */}

            <div className="form-group">

              <label>
                Project Title
              </label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={
                  handleChange
                }
                placeholder="e.g. Website Design"
              />

            </div>


            {/* CLIENT */}

            <div className="form-group">

              <label>
                Client
              </label>

              <select
                name="client"
                value={form.client}
                onChange={
                  handleChange
                }
              >

                <option value="">
                  Select a client
                </option>

                {clients.map(
                  (client) => (
                    <option
                      key={
                        client._id ||
                        client.id
                      }
                      value={
                        client._id ||
                        client.id
                      }
                    >
                      {client.name}
                    </option>
                  )
                )}

              </select>

            </div>


            {/* PRICE */}

            <div className="form-group">

              <label>
                Price
              </label>

              <input
                type="number"
                name="price"
                min="0"
                value={form.price}
                onChange={
                  handleChange
                }
                placeholder="50000"
              />

            </div>


            {/* STATUS */}

            <div className="form-group">

              <label>
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={
                  handleChange
                }
              >

                <option value="Planning">
                  Planning
                </option>

                <option value="In Progress">
                  In Progress
                </option>

                <option value="Completed">
                  Completed
                </option>

                <option value="On Hold">
                  On Hold
                </option>

              </select>

            </div>


            {/* DEADLINE */}

            <div className="form-group">

              <label>
                Deadline
              </label>

              <input
                type="date"
                name="deadline"
                value={
                  form.deadline
                }
                onChange={
                  handleChange
                }
              />

              {form.deadline && (
                <small
                  style={{
                    display:
                      'block',
                    marginTop:
                      '6px',
                    color:
                      '#8b91a1',
                    fontSize:
                      '11px'
                  }}
                >
                  Selected:
                  {' '}
                  {form.deadline}
                </small>
              )}

            </div>


            {/* DESCRIPTION */}

            <div className="form-group full-width">

              <label>
                Description
              </label>

              <textarea
                name="description"
                value={
                  form.description
                }
                onChange={
                  handleChange
                }
                placeholder="Describe the project..."
                rows="4"
              />

            </div>


            {/* FORM BUTTONS */}

            <div className="form-buttons">

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : editingProject
                  ? 'Update Project'
                  : 'Create Project'}
              </button>

              <button
                type="button"
                className="cancel-button"
                onClick={
                  handleCancel
                }
                disabled={saving}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      )}


      {/* =====================================================
          PROJECT LIST
      ===================================================== */}

      <div className="panel projects-list-panel">

        {/* LIST HEADER */}

        <div className="projects-list-header">

          <div>

            <h2>
              All Projects
            </h2>

            <p>
              {projects.length}{' '}
              {projects.length === 1
                ? 'project'
                : 'projects'}
            </p>

          </div>

          <span className="project-count">
            {displayedProjects.length}{' '}
            Showing
          </span>

        </div>


        {/* ===================================================
            SEARCH / FILTER / SORT
        =================================================== */}

        <div className="projects-filters">

          {/* SEARCH */}

          <div className="project-search">

            <input
              type="text"
              placeholder="Search projects or clients..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
            />

          </div>


          {/* STATUS FILTER */}

          <div className="project-filter">

            <select
              value={
                statusFilter
              }
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
                All Statuses
              </option>

              <option value="Planning">
                Planning
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="On Hold">
                On Hold
              </option>

            </select>

          </div>


          {/* SORT */}

          <div className="project-filter">

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value
                )
              }
            >

              <option value="None">
                Sort by Deadline
              </option>

              <option value="Deadline Ascending">
                Earliest Deadline
              </option>

              <option value="Deadline Descending">
                Latest Deadline
              </option>

            </select>

          </div>

        </div>


        {/* ===================================================
            NO PROJECTS
        =================================================== */}

        {projects.length === 0 ? (

          <div className="projects-empty">

            <div className="projects-empty-icon">
              📁
            </div>

            <h3>
              No projects yet
            </h3>

            <p>
              Create your first project
              to get started.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={
                handleAddProject
              }
            >
              + Add Project
            </button>

          </div>

        ) : displayedProjects.length === 0 ? (

          /* =================================================
             NO SEARCH/FILTER RESULTS
          ================================================= */

          <div className="projects-empty">

            <div className="projects-empty-icon">
              🔍
            </div>

            <h3>
              No matching projects
            </h3>

            <p>
              Try changing your search
              or filter.
            </p>

            <button
              type="button"
              className="cancel-button"
              onClick={
                clearFilters
              }
            >
              Clear Filters
            </button>

          </div>

        ) : (

          /* =================================================
             PROJECT LIST
          ================================================= */

          <div className="projects-list">

            {displayedProjects.map(
              (project) => {

                const projectId =
                  project._id ||
                  project.id;

                const firstLetter =
                  project.title
                    ?.charAt(0)
                    .toUpperCase() ||
                  'P';

                return (
                  <div
                    className="project-row"
                    key={projectId}
                  >

                    {/* PROJECT ICON */}

                    <div className="project-icon">
                      {firstLetter}
                    </div>


                    {/* PROJECT INFORMATION */}

                    <div className="project-main-info">

                      <h3>
                        {project.title}
                      </h3>

                      <p className="project-client">
                        {getClientName(
                          project
                        )}
                      </p>

                      <p className="project-description">
                        {project.description ||
                          'No description'}
                      </p>

                    </div>


                    {/* PRICE */}

                    <div className="project-meta">

                      <span>
                        Price
                      </span>

                      <strong>
                        {formatPrice(
                          project.price
                        )}
                      </strong>

                    </div>


                    {/* DEADLINE */}

                    <div className="project-meta">

                      <span>
                        Deadline
                      </span>

                      <strong>
                        {formatDate(
                          project.deadline
                        )}
                      </strong>

                    </div>


                    {/* ACTIONS */}

                    <div className="project-actions">

                      {/* STATUS */}

                      <div className="project-status">

                        <span
                          className={`status-badge ${getStatusClass(
                            project.status
                          )}`}
                        >
                          {project.status ||
                            'Planning'}
                        </span>

                      </div>


                      {/* BUTTONS */}

                      <div className="project-buttons">

                        <button
                          type="button"
                          className="view-project-button"
                          onClick={() =>
                            navigate(
                              `/projects/${projectId}`
                            )
                          }
                        >
                          View Details
                        </button>


                        <button
                          type="button"
                          className="edit-project-button"
                          onClick={() =>
                            handleEdit(
                              project
                            )
                          }
                        >
                          Edit
                        </button>


                        <button
                          type="button"
                          className="delete-project-button"
                          onClick={() =>
                            handleDelete(
                              projectId
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default Projects;