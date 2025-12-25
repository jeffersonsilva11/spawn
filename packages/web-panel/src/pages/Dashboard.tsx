/**
 * Dashboard Page - Main App Component
 *
 * Authenticated dashboard with real API integration
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import api from '../services/api';
import '../styles/Dashboard.css';

interface Project {
  id: string;
  name: string;
  description?: string;
  apiKey: string;
  createdAt: string;
}

interface Stats {
  totalProjects: number;
  activeServers: number;
  totalBuilds: number;
}

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // State
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats>({ totalProjects: 0, activeServers: 0, totalBuilds: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [creating, setCreating] = useState(false);

  // Check API health and load data on mount
  useEffect(() => {
    checkApiHealth();
    loadDashboardData();
  }, []);

  const checkApiHealth = async () => {
    try {
      await api.checkHealth();
      setApiStatus('connected');
    } catch (err) {
      console.error('API health check failed:', err);
      setApiStatus('error');
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch projects
      const projectsData = await api.getProjects();
      setProjects(projectsData);

      // Calculate stats
      const totalProjects = projectsData.length;
      let activeServers = 0;
      let totalBuilds = 0;

      // Fetch servers and builds for each project
      for (const project of projectsData) {
        try {
          const servers = await api.getServers(project.id);
          activeServers += servers.filter((s: any) => s.status === 'running').length;

          const builds = await api.getBuilds(project.id);
          totalBuilds += builds.length;
        } catch (err) {
          console.error(`Error fetching data for project ${project.id}:`, err);
        }
      }

      setStats({ totalProjects, activeServers, totalBuilds });
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      alert(t('projects.name_required'));
      return;
    }

    try {
      setCreating(true);
      await api.createProject({
        name: newProjectName.trim(),
        description: '',
      });

      // Reload data
      await loadDashboardData();

      // Close modal and reset
      setShowCreateModal(false);
      setNewProjectName('');
    } catch (err: any) {
      console.error('Error creating project:', err);
      alert(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="container">
          <h1>{t('dashboard.title')}</h1>
          <div className="header-actions">
            <span className="user-email">{user?.email}</span>
            <LanguageSwitcher />
            <button onClick={handleLogout} className="btn-logout">
              {t('auth.logout', { defaultValue: 'Logout' })}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="container">
          {/* Welcome Message */}
          <section className="welcome-section">
            <h2>{t('dashboard.welcome', { name: user?.email.split('@')[0] || 'Developer' })}</h2>
            <p className="subtitle">
              {t('dashboard.overview')}
            </p>
          </section>

          {/* Quick Stats */}
          <section className="stats-grid">
            <div className="stat-card">
              <h3>{t('dashboard.total_projects')}</h3>
              <p className="stat-value">{loading ? '...' : stats.totalProjects}</p>
            </div>
            <div className="stat-card">
              <h3>{t('dashboard.active_servers')}</h3>
              <p className="stat-value">{loading ? '...' : stats.activeServers}</p>
            </div>
            <div className="stat-card">
              <h3>{t('dashboard.total_builds')}</h3>
              <p className="stat-value">{loading ? '...' : stats.totalBuilds}</p>
            </div>
          </section>

          {/* Error State */}
          {error && (
            <section className="error-state">
              <p>{error}</p>
              <button className="btn-primary" onClick={loadDashboardData}>
                {t('common.retry')}
              </button>
            </section>
          )}

          {/* Empty State or Projects List */}
          {!loading && !error && projects.length === 0 && (
            <section className="empty-state">
              <div className="empty-state-content">
                <h3>{t('projects.no_projects')}</h3>
                <p>{t('projects.create_first')}</p>
                <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                  {t('projects.create')}
                </button>
              </div>
            </section>
          )}

          {!loading && !error && projects.length > 0 && (
            <section className="projects-section">
              <div className="section-header">
                <h2>{t('projects.my_projects')}</h2>
                <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
                  {t('projects.create')}
                </button>
              </div>
              <div className="projects-grid">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/dashboard/projects/${project.id}`}
                    className="project-card"
                  >
                    <h3>{project.name}</h3>
                    {project.description && <p>{project.description}</p>}
                    <div className="project-meta">
                      <small>{t('projects.created')}: {new Date(project.createdAt).toLocaleDateString()}</small>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* API Status */}
          <section className="api-status">
            <small>
              Backend API: <span id="api-status" className={apiStatus}>
                {apiStatus === 'checking' && 'Checking...'}
                {apiStatus === 'connected' && '✓ Connected'}
                {apiStatus === 'error' && '✗ Disconnected'}
              </span>
            </small>
          </section>
        </div>
      </main>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('projects.create')}</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="project-name">{t('projects.name')}</label>
                <input
                  id="project-name"
                  type="text"
                  className="form-input"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder={t('projects.name_placeholder')}
                  disabled={creating}
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
              >
                {t('common.cancel')}
              </button>
              <button
                className="btn-primary"
                onClick={handleCreateProject}
                disabled={creating || !newProjectName.trim()}
              >
                {creating ? t('common.creating') : t('projects.create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
