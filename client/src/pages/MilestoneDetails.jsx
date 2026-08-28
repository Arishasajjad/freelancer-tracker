import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

function MilestoneDetails() {
  const { milestoneId } = useParams();
  const navigate = useNavigate();

  const [milestone, setMilestone] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  const formatPrice = (price) => {
    return `PKR ${Number(price || 0).toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return 'No due date';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return 'No due date';
    }

    const day = String(parsed.getDate()).padStart(2, '0');
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const getStatusClass = (status) => {
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

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (!milestoneId) {
      navigate('/milestones');
      return;
    }

    const fetchMilestone = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/milestones/${milestoneId}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        console.log('MILESTONE DETAILS:', data);

        if (!response.ok) {
          alert(
            data.message ||
              'Failed to load milestone.'
          );

          navigate('/milestones');
          return;
        }

        if (data.milestone) {
          setMilestone(data.milestone);
        } else {
          setMilestone(data);
        }

      } catch (error) {
        console.error(
          'FETCH MILESTONE ERROR:',
          error
        );

        alert('Cannot connect to server.');
        navigate('/milestones');

      } finally {
        setLoading(false);
      }
    };

    fetchMilestone();

  }, [milestoneId]);

  if (loading) {
    return (
      <div className="milestone-details-page">
        <div className="page-placeholder">
          <p>Loading milestone...</p>
        </div>
      </div>
    );
  }

  if (!milestone) {
    return (
      <div className="milestone-details-page">
        <div className="page-placeholder">
          <h2>Milestone not found</h2>

          <button
            type="button"
            className="primary-button"
            onClick={() => navigate('/milestones')}
          >
            Back to Milestones
          </button>
        </div>
      </div>
    );
  }

  const projectId =
    milestone.project?._id ||
    milestone.project?.id ||
    milestone.project;

  const projectName =
    milestone.project?.title ||
    milestone.project?.name ||
    'Unknown project';

  return (
    <div className="milestone-details-page">

      {/* BACK */}

      <button
        type="button"
        className="back-button"
        onClick={() => navigate('/milestones')}
      >
        ← Back to Milestones
      </button>

      {/* HEADER */}

      <div className="milestone-details-header">

        <div>
          <p className="milestones-eyebrow">
            Milestone Details
          </p>

          <h1>
            {milestone.title}
          </h1>

          <p className="milestones-subtitle">
            {milestone.description ||
              'No milestone description'}
          </p>
        </div>

        <span
          className={`milestone-status ${getStatusClass(
            milestone.status
          )}`}
        >
          {milestone.status || 'Pending'}
        </span>

      </div>

      {/* INFORMATION */}

      <div className="milestone-details-grid">

        {/* PROJECT */}

        <div className="panel milestone-detail-card">

          <span>
            Project
          </span>

          <strong>
            {projectName}
          </strong>

        </div>

        {/* PRICE */}

        <div className="panel milestone-detail-card">

          <span>
            Milestone Price
          </span>

          <strong>
            {formatPrice(milestone.price)}
          </strong>

        </div>

        {/* DUE DATE */}

        <div className="panel milestone-detail-card">

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

        <div className="panel milestone-detail-card">

          <span>
            Status
          </span>

          <strong>
            {milestone.status || 'Pending'}
          </strong>

        </div>

      </div>

      {/* DESCRIPTION */}

      <div className="panel milestone-description-card">

        <p className="milestones-eyebrow">
          About This Milestone
        </p>

        <h2>
          Description
        </h2>

        <p>
          {milestone.description ||
            'No description was added for this milestone.'}
        </p>

      </div>

      {/* ACTIONS */}

      <div className="milestone-details-actions">

        {projectId && (
          <button
            type="button"
            className="cancel-button"
            onClick={() =>
              navigate(
                `/milestones/${projectId}`
              )
            }
          >
            ← Project Milestones
          </button>
        )}

      </div>

    </div>
  );
}

export default MilestoneDetails;