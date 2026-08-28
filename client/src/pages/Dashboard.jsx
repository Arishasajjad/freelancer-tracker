import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const initialStats = {
  totalClients: 0,
  totalProjects: 0,
  activeProjects: 0,
  completedProjects: 0,
  totalInvoiced: 0,
  totalPaid: 0,
  totalExpenses: 0,
  pendingAmount: 0,
  netProfit: 0,
  recentProjects: []
};

function Dashboard() {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const formatPrice = (amount) => {
    return `PKR ${Number(amount || 0).toLocaleString()}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';

    return 'Good evening';
  };

  const getStatusClass = (status) => {
    return String(status || 'Planning')
      .toLowerCase()
      .replace(/\s+/g, '-');
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `${API_URL}/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (response.ok) {
          setStats({
            ...initialStats,
            ...data
          });
        } else {
          setError(
            data.message ||
            'Could not load dashboard data.'
          );
        }
      } catch (error) {
        console.error('Dashboard error:', error);
        setError('Could not connect to the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="page-placeholder">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="topbar">
        <div>
          <p className="welcome">
            {getGreeting()} 👋
          </p>

          <h1>Dashboard</h1>
        </div>

        <button
          type="button"
          className="profile-button"
        >
          TF
        </button>
      </header>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>

          <div>
            <p>Total Clients</p>
            <h2>{stats.totalClients}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📁</div>

          <div>
            <p>Total Projects</p>
            <h2>{stats.totalProjects}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>

          <div>
            <p>Payments Received</p>
            <h2>{formatPrice(stats.totalPaid)}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>

          <div>
            <p>Net Profit</p>
            <h2
              className={
                stats.netProfit < 0
                  ? 'negative-value'
                  : 'positive-value'
              }
            >
              {formatPrice(stats.netProfit)}
            </h2>
          </div>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Recent Projects</h2>
              <p>Your latest project activity</p>
            </div>

            <NavLink
              to="/projects"
              className="primary-button"
            >
              View Projects
            </NavLink>
          </div>

          {stats.recentProjects.length === 0 ? (
            <div className="dashboard-empty">
              <p>
                No projects yet. Create your first
                project to see it here.
              </p>
            </div>
          ) : (
            <div className="dashboard-projects-list">
              {stats.recentProjects.map((project) => (
                <div
                  className="project-item"
                  key={project._id}
                >
                  <div className="project-info">
                    <div className="project-icon">
                      {project.title
                        ?.charAt(0)
                        .toUpperCase() || 'P'}
                    </div>

                    <div>
                      <h3>{project.title}</h3>

                      <p>
                        {project.client?.name ||
                          'Unknown client'}
                      </p>
                    </div>
                  </div>

                  <div className="project-right">
                    <span
                      className={`dashboard-status ${getStatusClass(
                        project.status
                      )}`}
                    >
                      {project.status || 'Planning'}
                    </span>

                    <strong>
                      {formatPrice(project.price)}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Financial Overview</h2>
              <p>Your business summary</p>
            </div>
          </div>

          <div className="finance-row">
            <span>Total Invoiced</span>
            <strong>
              {formatPrice(stats.totalInvoiced)}
            </strong>
          </div>

          <div className="finance-row">
            <span>Payments Received</span>
            <strong>
              {formatPrice(stats.totalPaid)}
            </strong>
          </div>

          <div className="finance-row">
            <span>Business Expenses</span>
            <strong className="expense-value">
              {formatPrice(stats.totalExpenses)}
            </strong>
          </div>

          <div className="finance-row">
            <span>Outstanding Amount</span>
            <strong className="pending-value">
              {formatPrice(stats.pendingAmount)}
            </strong>
          </div>

          <div className="finance-row pending-row">
            <span>Net Profit</span>
            <strong
              className={
                stats.netProfit < 0
                  ? 'negative-value'
                  : 'positive-value'
              }
            >
              {formatPrice(stats.netProfit)}
            </strong>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;