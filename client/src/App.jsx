import './App.css';
import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink
} from 'react-router-dom';

import Clients from './pages/Clients';
import Projects from './pages/Projects';
import Milestones from './pages/Milestones';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import Expenses from './pages/Expenses';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import ClientDetails from './pages/ClientDetails';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';
import MilestoneDetails from './pages/MilestoneDetails';


const API_URL = 'https://freelancer-tracker-pn21.onrender.com/api';

function App() {
  const [profile, setProfile] = useState({
    name: 'Freelancer',
    businessName: 'Freelancer'
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${API_URL}/auth/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (response.ok) {
          setProfile(data.user);
        }
      } catch (error) {
        console.error(
          'Could not load profile:',
          error
        );
      }
    };

    if (token) {
      fetchProfile();
    }
  }, []);

  const getInitials = (name) => {
    return String(name || 'Freelancer')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join('');
  };

  return (
    <BrowserRouter>
      <div className="app">

        <aside className="sidebar">

          <div className="logo">
            <div className="logo-icon">F</div>

            <div>
              <h2>Freelancer</h2>
              <span>Tracker</span>
            </div>
          </div>

          <nav className="nav">

            <NavLink
              to="/"
              end
              className="nav-item"
            >
              <span>▦</span>
              Dashboard
            </NavLink>

            <NavLink
              to="/clients"
              className="nav-item"
            >
              <span>♙</span>
              Clients
            </NavLink>

            <NavLink
              to="/projects"
              className="nav-item"
            >
              <span>▣</span>
              Projects
            </NavLink>

            <NavLink
              to="/milestones"
              className="nav-item"
            >
              <span>✓</span>
              Milestones
            </NavLink>

            <NavLink
              to="/invoices"
              className="nav-item"
            >
              <span>▤</span>
              Invoices
            </NavLink>

            <NavLink
              to="/payments"
              className="nav-item"
            >
              <span>₨</span>
              Payments
            </NavLink>

            <NavLink
              to="/expenses"
              className="nav-item"
            >
              <span>🧾</span>
              Expenses
            </NavLink>

          </nav>

          <div className="sidebar-bottom">

            <NavLink
              to="/settings"
              className="nav-item"
            >
              <span>⚙</span>
              Settings
            </NavLink>

            <div className="user-card">
              <div className="avatar">
                {getInitials(profile.name)}
              </div>

              <div>
                <strong>
                  {profile.name || 'Freelancer'}
                </strong>

                <small>
                  {profile.businessName || 'Freelancer'}
                </small>
              </div>
            </div>

          </div>

        </aside>

        <main className="main">


          <Routes>
            <Route
              path="/login"
              element={<Login />}
            />


           <Route
              path="/register"
             element={<Register />}
          />

            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/clients"
              element={<Clients />}
            />

            <Route
              path="/clients/:id"
              element={<ClientDetails />}
            />

            <Route
              path="/projects"
              element={<Projects />}
            />

            <Route
              path="/projects/:projectId"
              element={<ProjectDetails />}
            />

            <Route
              path="/milestones"
              element={<Milestones />}
            />

           <Route
              path="/milestones/:milestoneId/details"
              element={<MilestoneDetails />}
          />

            <Route
               path="/milestones/:projectId"
                element={<Milestones />}
            />

            <Route
              path="/invoices"
              element={<Invoices />}
            />

            <Route
              path="/payments"
              element={<Payments />}
            />

            <Route
              path="/expenses"
              element={<Expenses />}
            />

            <Route
              path="/settings"
              element={<Settings />}
            />
          </Routes>

        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;