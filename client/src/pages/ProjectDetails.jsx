import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  // =========================================================
  // FORMAT PRICE
  // =========================================================

  const formatPrice = (price) => {
    const number = Number(price || 0);

    return `PKR ${number.toLocaleString()}`;
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return 'No date';
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return 'No date';
    }

    const day = String(
      parsed.getDate()
    ).padStart(2, '0');

    const month = String(
      parsed.getMonth() + 1
    ).padStart(2, '0');

    const year = parsed.getFullYear();

    return `${day}/${month}/${year}`;
  };

  // =========================================================
  // PROJECT STATUS CLASS
  // =========================================================

  const getProjectStatusClass = (status) => {
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
  // FETCH PROJECT
  // =========================================================

  const fetchProject = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/projects/${projectId}`,
        {
          method: 'GET',

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log(
        'PROJECT DETAILS RESPONSE:',
        data
      );

      if (!response.ok) {
        alert(
          data.message ||
            'Failed to load project.'
        );

        navigate('/projects');

        return;
      }

      if (data.project) {
        setProject(data.project);
      } else {
        setProject(data);
      }
    } catch (error) {
      console.error(
        'FETCH PROJECT ERROR:',
        error
      );

      alert(
        'Cannot connect to server.'
      );

      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD PROJECT
  // =========================================================

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (!projectId) {
      navigate('/projects');
      return;
    }

    fetchProject();
  }, [projectId]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="project-details-page">

        <div className="page-placeholder">

          <p>
            Loading project...
          </p>

        </div>

      </div>
    );
  }

  // =========================================================
  // PROJECT NOT FOUND
  // =========================================================

  if (!project) {
    return (
      <div className="project-details-page">

        <div className="page-placeholder">

          <h2>
            Project not found
          </h2>

          <button
            type="button"
            className="primary-button"
            onClick={() =>
              navigate('/projects')
            }
          >
            Back to Projects
          </button>

        </div>

      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="project-details-page">

      {/* =====================================================
          BACK BUTTON
      ===================================================== */}

      <button
        type="button"
        className="back-button"
        onClick={() =>
          navigate('/projects')
        }
      >
        ← Back to Projects
      </button>


      {/* =====================================================
          PROJECT HEADER
      ===================================================== */}

      <div className="project-details-header">

        <div className="project-details-title-area">

          <p className="projects-eyebrow">
            Project Details
          </p>

          <h1>
            {project.title}
          </h1>

          <p className="projects-subtitle">
            {project.description ||
              'No project description'}
          </p>

        </div>


        {/* PROJECT STATUS */}

        <span
          className={`status-badge ${getProjectStatusClass(
            project.status
          )}`}
        >
          {project.status ||
            'Planning'}
        </span>

      </div>


      {/* =====================================================
          PROJECT INFORMATION
      ===================================================== */}

      <div className="project-details-grid">

        {/* CLIENT */}

        <div className="panel project-detail-card">

          <div className="project-detail-icon">
            👤
          </div>

          <div className="project-detail-content">

            <span>
              Client
            </span>

            <strong>
              {project.client?.name ||
                'Unknown client'}
            </strong>

          </div>

        </div>


        {/* PRICE */}

        <div className="panel project-detail-card">

          <div className="project-detail-icon">
            💰
          </div>

          <div className="project-detail-content">

            <span>
              Project Price
            </span>

            <strong>
              {formatPrice(
                project.price
              )}
            </strong>

          </div>

        </div>


        {/* DEADLINE */}

        <div className="panel project-detail-card">

          <div className="project-detail-icon">
            📅
          </div>

          <div className="project-detail-content">

            <span>
              Deadline
            </span>

            <strong>
              {formatDate(
                project.deadline
              )}
            </strong>

          </div>

        </div>


        {/* STATUS */}

        <div className="panel project-detail-card">

          <div className="project-detail-icon">
            📊
          </div>

          <div className="project-detail-content">

            <span>
              Current Status
            </span>

            <strong>
              {project.status ||
                'Planning'}
            </strong>

          </div>

        </div>

      </div>


      {/* =====================================================
          MILESTONES
      ===================================================== */}

      <div className="panel project-milestones-card">

        {/* TOP SECTION */}

        <div className="milestones-top">

          <div className="milestones-icon-wrapper">
            🎯
          </div>

          <div className="milestones-heading">

            <div className="milestones-title-row">

              <div>

                <p className="milestones-eyebrow">
                  Project Planning
                </p>

                <h2>
                  Milestones
                </h2>

              </div>

              <span className="milestones-count">
                Track progress
              </span>

            </div>

            <p className="milestones-description">
              Break this project into smaller
              milestones and keep track of
              your progress, deadlines, and
              payments.
            </p>

          </div>

        </div>


        {/* DIVIDER */}

        <div className="milestones-divider"></div>


        {/* BOTTOM ACTION AREA */}

        <div className="milestones-action-area">

          <div className="milestones-action-text">

            <strong>
              Manage project milestones
            </strong>

            <span>
              View, add, edit, and track
              milestones for this project.
            </span>

          </div>


          <button
            type="button"
            className="view-milestones-button"
            onClick={() =>
              navigate(
                `/milestones/${projectId}`
              )
            }
          >
            <span>
              View Milestones
            </span>

            <span className="milestone-arrow">
              →
            </span>

          </button>

        </div>

      </div>

    </div>
  );
}

export default ProjectDetails;