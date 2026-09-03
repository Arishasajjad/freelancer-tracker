import { useEffect, useState } from 'react';

const API_URL = 'https://freelancer-tracker-pn21.onrender.com/api';

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');

        if (!token) {
          setError('Please login first.');
          setLoading(false);
          return;
        }

        // CORRECT URL:
        // API_URL already contains /api
        const response = await fetch(`${API_URL}/dashboard`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load dashboard');
        }

        setDashboard(data);
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Could not connect to the server');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <h1>Dashboard</h1>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <h1>Dashboard</h1>

        <div className="error-message">
          {error}
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="dashboard-container">
        <h1>Dashboard</h1>
        <p>No dashboard data available.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>

      {/* SUMMARY CARDS */}
      <div className="dashboard-cards">

        <div className="dashboard-card">
          <h3>Total Clients</h3>
          <p>
            {dashboard.totalClients ?? 0}
          </p>
        </div>

        <div className="dashboard-card">
          <h3>Total Projects</h3>
          <p>
            {dashboard.totalProjects ?? 0}
          </p>
        </div>

        <div className="dashboard-card">
          <h3>Payments Received</h3>
          <p>
            PKR {dashboard.totalPayments ?? 0}
          </p>
        </div>

        <div className="dashboard-card">
          <h3>Net Profit</h3>
          <p>
            PKR {dashboard.netProfit ?? 0}
          </p>
        </div>

      </div>

      {/* RECENT PROJECTS */}
      <div className="recent-projects">
        <h2>Recent Projects</h2>

        {dashboard.recentProjects &&
        dashboard.recentProjects.length > 0 ? (
          <div className="projects-list">

            {dashboard.recentProjects.map((project) => (
              <div
                className="project-item"
                key={project._id}
              >
                <div>
                  <h3>{project.title}</h3>

                  <p>
                    Client:{' '}
                    {project.client?.name || 'No client'}
                  </p>

                  <p>
                    Status:{' '}
                    {project.status || 'Not specified'}
                  </p>
                </div>

                <div>
                  <p>
                    Price: PKR {project.price ?? 0}
                  </p>

                  {project.deadline && (
                    <p>
                      Deadline:{' '}
                      {new Date(
                        project.deadline
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}

          </div>
        ) : (
          <p>No recent projects found.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;