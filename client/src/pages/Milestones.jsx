import { useEffect, useState } from 'react';
import {
  useNavigate,
  useParams
} from 'react-router-dom';

const API_URL = 'https://freelancer-tracker-pn21.onrender.com/api';
const emptyForm = {
  project: '',
  title: '',
  description: '',
  price: '',
  dueDate: '',
  status: 'Pending'
};

function Milestones() {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [milestones, setMilestones] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const token = localStorage.getItem('token');

  // =========================================================
  // HEADERS
  // =========================================================

  const getHeaders = (json = false) => {
    const headers = {
      Authorization: `Bearer ${token}`
    };

    if (json) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  };

  // =========================================================
  // SAFE RESPONSE
  // =========================================================

  const readResponse = async (response) => {
    const text = await response.text();

    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      return {
        message: text
      };
    }
  };

  // =========================================================
  // DATE
  // =========================================================

  const getInputDate = (date) => {
    if (!date) {
      return '';
    }

    if (
      typeof date === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      return date;
    }

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

  const formatDate = (date) => {
    const cleanDate = getInputDate(date);

    if (!cleanDate) {
      return 'No due date';
    }

    const [year, month, day] =
      cleanDate.split('-');

    return `${day}/${month}/${year}`;
  };

  // =========================================================
  // PRICE
  // =========================================================

  const formatPrice = (price) => {
    const number = Number(price || 0);

    return `PKR ${number.toLocaleString()}`;
  };

  // =========================================================
  // FETCH MILESTONES
  // =========================================================

  const fetchMilestones = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/milestones`,
        {
          method: 'GET',
          headers: getHeaders()
        }
      );

      const data =
        await readResponse(response);

      if (!response.ok) {
        console.error(
          'Milestones fetch failed:',
          data
        );

        setMilestones([]);
        return;
      }

      let allMilestones = [];

      if (Array.isArray(data)) {
        allMilestones = data;
      } else if (
        Array.isArray(data.milestones)
      ) {
        allMilestones = data.milestones;
      } else if (
        Array.isArray(data.data)
      ) {
        allMilestones = data.data;
      }

      // =====================================================
      // FILTER BY PROJECT
      // =====================================================

      if (projectId) {
        const filteredMilestones =
          allMilestones.filter(
            (milestone) => {
              const milestoneProjectId =
                milestone.project?._id ||
                milestone.project?.id ||
                milestone.project;

              return (
                String(
                  milestoneProjectId
                ) === String(projectId)
              );
            }
          );

        setMilestones(
          filteredMilestones
        );
      } else {
        setMilestones(
          allMilestones
        );
      }

    } catch (error) {
      console.error(
        'FETCH MILESTONES ERROR:',
        error
      );

      setMilestones([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH PROJECTS
  // =========================================================

  const fetchProjects = async () => {
    try {
      const response = await fetch(
        `${API_URL}/projects`,
        {
          method: 'GET',
          headers: getHeaders()
        }
      );

      const data =
        await readResponse(response);

      if (!response.ok) {
        setProjects([]);
        return;
      }

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

    } catch (error) {
      console.error(
        'FETCH PROJECTS ERROR:',
        error
      );

      setProjects([]);
    }
  };

  // =========================================================
  // LOAD
  // =========================================================

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    fetchMilestones();
    fetchProjects();
  }, [projectId]);

  // =========================================================
  // CURRENT PROJECT
  // =========================================================

  const currentProject =
    projects.find(
      (project) =>
        String(
          project._id ||
          project.id
        ) === String(projectId)
    );

  // =========================================================
  // INPUT
  // =========================================================

  const handleChange = (e) => {
    const {
      name,
      value
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // =========================================================
  // ADD
  // =========================================================

  const handleAddMilestone = () => {
    setEditingMilestone(null);

    setForm({
      ...emptyForm,
      project: projectId || ''
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEdit = (milestone) => {
    setEditingMilestone(milestone);

    const milestoneProjectId =
      milestone.project?._id ||
      milestone.project?.id ||
      milestone.project ||
      '';

    setForm({
      project: milestoneProjectId,

      title:
        milestone.title || '',

      description:
        milestone.description || '',

      price:
        milestone.price !== undefined &&
        milestone.price !== null
          ? String(milestone.price)
          : '',

      dueDate:
        getInputDate(
          milestone.dueDate ||
          milestone.deadline
        ),

      status:
        milestone.status ||
        'Pending'
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // =========================================================
  // VIEW MILESTONE
  // =========================================================

  const handleView = (milestone) => {
    const milestoneId =
      milestone._id ||
      milestone.id;

    const milestoneProjectId =
      milestone.project?._id ||
      milestone.project?.id ||
      milestone.project ||
      projectId;

    if (!milestoneId) {
      alert(
        'Milestone ID is missing.'
      );
      return;
    }

    navigate(
      `/milestones/${milestoneProjectId}/${milestoneId}`
    );
  };

  // =========================================================
  // CANCEL
  // =========================================================

  const handleCancel = () => {
    setShowForm(false);
    setEditingMilestone(null);

    setForm({
      ...emptyForm,
      project: projectId || ''
    });
  };

  // =========================================================
  // CREATE / UPDATE
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert(
        'You are not logged in.'
      );
      return;
    }

    if (!form.project) {
      alert(
        'Please select a project.'
      );
      return;
    }

    if (!form.title.trim()) {
      alert(
        'Milestone title is required.'
      );
      return;
    }

    if (form.price === '') {
      alert(
        'Milestone price is required.'
      );
      return;
    }

    const numericPrice =
      Number(form.price);

    if (Number.isNaN(numericPrice)) {
      alert(
        'Please enter a valid price.'
      );
      return;
    }

    if (numericPrice < 0) {
      alert(
        'Price cannot be negative.'
      );
      return;
    }

    setSaving(true);

    try {
      const milestoneData = {
        project: form.project,

        title:
          form.title.trim(),

        description:
          form.description.trim(),

        price:
          numericPrice,

        dueDate:
          form.dueDate
            ? `${form.dueDate}T00:00:00.000Z`
            : null,

        status:
          form.status
      };

      let url;
      let method;

      if (editingMilestone) {
        const milestoneId =
          editingMilestone._id ||
          editingMilestone.id;

        if (!milestoneId) {
          alert(
            'Milestone ID is missing.'
          );

          setSaving(false);
          return;
        }

        url =
          `${API_URL}/milestones/${milestoneId}`;

        method = 'PUT';
      } else {
        url =
          `${API_URL}/milestones`;

        method = 'POST';
      }

      const response =
        await fetch(
          url,
          {
            method,
            headers:
              getHeaders(true),
            body:
              JSON.stringify(
                milestoneData
              )
          }
        );

      const data =
        await readResponse(
          response
        );

      if (response.ok) {
        alert(
          editingMilestone
            ? 'Milestone updated successfully!'
            : 'Milestone created successfully!'
        );

        handleCancel();

        await fetchMilestones();

        return;
      }

      alert(
        data.message ||
        data.error ||
        'Server error'
      );

    } catch (error) {
      console.error(
        'SAVE MILESTONE ERROR:',
        error
      );

      alert(
        `Cannot connect to server.\n\n${error.message}`
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (
    milestoneId
  ) => {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this milestone?'
      );

    if (!confirmed) {
      return;
    }

    try {
      const response =
        await fetch(
          `${API_URL}/milestones/${milestoneId}`,
          {
            method: 'DELETE',
            headers:
              getHeaders()
          }
        );

      const data =
        await readResponse(
          response
        );

      if (response.ok) {
        alert(
          'Milestone deleted successfully!'
        );

        setMilestones(
          (previous) =>
            previous.filter(
              (milestone) =>
                String(
                  milestone._id ||
                  milestone.id
                ) !==
                String(milestoneId)
            )
        );
      } else {
        alert(
          data.message ||
          data.error ||
          'Failed to delete milestone.'
        );
      }

    } catch (error) {
      console.error(
        'DELETE MILESTONE ERROR:',
        error
      );

      alert(
        `Cannot connect to server.\n\n${error.message}`
      );
    }
  };

  // =========================================================
  // PROJECT NAME
  // =========================================================

  const getProjectName = (
    milestone
  ) => {
    if (
      milestone.project &&
      typeof milestone.project ===
        'object'
    ) {
      return (
        milestone.project.title ||
        milestone.project.name ||
        'Unknown project'
      );
    }

    const project =
      projects.find(
        (item) =>
          String(
            item._id ||
            item.id
          ) ===
          String(
            milestone.project
          )
      );

    return (
      project?.title ||
      project?.name ||
      'Unknown project'
    );
  };

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (
    status
  ) => {
    switch (status) {
      case 'Pending':
        return 'milestone-pending';

      case 'In Progress':
        return 'milestone-in-progress';

      case 'Completed':
        return 'milestone-completed';

      case 'On Hold':
        return 'milestone-on-hold';

      default:
        return 'milestone-pending';
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="milestones-page">
        <div className="page-placeholder">
          <p>
            Loading milestones...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="milestones-page">

      {/* BACK */}

      {projectId && (
        <button
          type="button"
          className="back-button"
          onClick={() =>
            navigate('/projects')
          }
        >
          ← Back to Projects
        </button>
      )}

      {/* HEADER */}

      <div className="milestones-page-header">

        <div>

          <p className="milestones-eyebrow">
            {projectId
              ? 'Project Progress'
              : 'Track project progress'}
          </p>

          <h1>
            {projectId
              ? currentProject?.title ||
                'Project Milestones'
              : 'Milestones'}
          </h1>

          <p className="milestones-subtitle">
            {projectId
              ? 'Milestones for this project only.'
              : 'Break your projects into clear, trackable checkpoints.'}
          </p>

        </div>

        <button
          type="button"
          className="primary-button"
          onClick={
            handleAddMilestone
          }
        >
          + Add Milestone
        </button>

      </div>

      {/* FORM */}

      {showForm && (
        <div className="panel milestone-form-panel">

          <div className="milestone-form-header">

            <div>

              <h2>
                {editingMilestone
                  ? 'Edit Milestone'
                  : 'Add New Milestone'}
              </h2>

              <p>
                {editingMilestone
                  ? 'Update your milestone information.'
                  : 'Add a checkpoint to one of your projects.'}
              </p>

            </div>

          </div>

          <form
            className="milestone-form"
            onSubmit={
              handleSubmit
            }
          >

            {/* PROJECT */}

            <div className="form-group">

              <label>
                Project
              </label>

              <select
                name="project"
                value={
                  form.project
                }
                onChange={
                  handleChange
                }
                required
              >

                <option value="">
                  Select a project
                </option>

                {projects.map(
                  (project) => {

                    const id =
                      project._id ||
                      project.id;

                    return (
                      <option
                        key={id}
                        value={id}
                      >
                        {project.title ||
                          project.name ||
                          'Untitled Project'}
                      </option>
                    );
                  }
                )}

              </select>

            </div>

            {/* TITLE */}

            <div className="form-group">

              <label>
                Milestone Title
              </label>

              <input
                type="text"
                name="title"
                value={
                  form.title
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. Homepage Design Approved"
                required
              />

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
                step="1"
                value={
                  form.price
                }
                onChange={
                  handleChange
                }
                placeholder="25000"
                required
              />

            </div>

            {/* STATUS */}

            <div className="form-group">

              <label>
                Status
              </label>

              <select
                name="status"
                value={
                  form.status
                }
                onChange={
                  handleChange
                }
              >

                <option value="Pending">
                  Pending
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

            {/* DATE */}

            <div className="form-group">

              <label>
                Due Date
              </label>

              <input
                type="date"
                name="dueDate"
                value={
                  form.dueDate
                }
                onChange={
                  handleChange
                }
              />

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
                placeholder="Describe what should be completed..."
                rows="4"
              />

            </div>

            {/* BUTTONS */}

            <div className="form-buttons">

              <button
                type="submit"
                className="primary-button"
                disabled={
                  saving
                }
              >
                {saving
                  ? 'Saving...'
                  : editingMilestone
                  ? 'Update Milestone'
                  : 'Create Milestone'}
              </button>

              <button
                type="button"
                className="cancel-button"
                onClick={
                  handleCancel
                }
                disabled={
                  saving
                }
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      )}

      {/* =====================================================
          MILESTONE LIST
      ===================================================== */}

      <div className="panel milestones-list-panel">

        <div className="milestones-list-header">

          <div>

            <h2>
              {projectId
                ? 'Project Milestones'
                : 'All Milestones'}
            </h2>

            <p>
              {milestones.length}{' '}
              {milestones.length === 1
                ? 'milestone'
                : 'milestones'}
            </p>

          </div>

          <span className="milestone-count">
            {milestones.length}{' '}
            Total
          </span>

        </div>

        {/* EMPTY */}

        {milestones.length === 0 ? (

          <div className="milestones-empty">

            <div className="milestones-empty-icon">
              🎯
            </div>

            <h3>
              {projectId
                ? 'No milestones for this project'
                : 'No milestones yet'}
            </h3>

            <p>
              {projectId
                ? 'Add a milestone to this project to start tracking its progress.'
                : 'Create your first milestone to track project progress.'}
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={
                handleAddMilestone
              }
            >
              + Add Milestone
            </button>

          </div>

        ) : (

          <div className="milestones-list">

            {milestones.map(
              (milestone) => {

                const milestoneId =
                  milestone._id ||
                  milestone.id;

                return (

                  <div
                    className="milestone-row"
                    key={
                      milestoneId
                    }
                  >

                    {/* ICON */}

                    <div className="milestone-icon">
                      ✓
                    </div>

                    {/* INFO */}

                    <div className="milestone-main-info">

                      <h3>
                        {milestone.title ||
                          'Untitled Milestone'}
                      </h3>

                      <p className="milestone-project">
                        {getProjectName(
                          milestone
                        )}
                      </p>

                      <p className="milestone-description">
                        {milestone.description ||
                          'No description'}
                      </p>

                    </div>

                    {/* PRICE */}

                    <div className="milestone-meta">

                      <span>
                        Price
                      </span>

                      <strong>
                        {formatPrice(
                          milestone.price
                        )}
                      </strong>

                    </div>

                    {/* DUE DATE */}

                    <div className="milestone-meta">

                      <span>
                        Due Date
                      </span>

                      <strong>
                        {formatDate(
                          milestone.dueDate ||
                          milestone.deadline
                        )}
                      </strong>

                    </div>

                    {/* STATUS */}

                    <div className="milestone-meta">

                      <span>
                        Status
                      </span>

                      <strong
                        className={`milestone-status ${getStatusClass(
                          milestone.status
                        )}`}
                      >
                        {milestone.status ||
                          'Pending'}
                      </strong>

                    </div>

                    {/* BUTTONS */}

                    <div className="milestone-buttons">

  <button
    type="button"
    className="view-project-button"
    onClick={() =>
      navigate(
        `/milestones/${milestoneId}/details`
      )
    }
  >
    View
  </button>

  <button
    type="button"
    className="edit-project-button"
    onClick={() =>
      handleEdit(
        milestone
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
        milestoneId
      )
    }
  >
    Delete
  </button>

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

export default Milestones;