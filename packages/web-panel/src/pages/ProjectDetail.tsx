/**
 * Project Detail Page
 *
 * Shows project details with tabs for Builds and Servers
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import api from '../services/api';
import '../styles/ProjectDetail.css';

interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

interface Build {
  id: string;
  version: string;
  status: string;
  createdAt: string;
}

interface Server {
  id: string;
  status: string;
  ip: string | null;
  port: number | null;
  buildId: string;
  lastHeartbeat: string | null;
  createdAt: string;
}

type TabType = 'overview' | 'builds' | 'servers';

export const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [project, setProject] = useState<Project | null>(null);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Upload build state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadVersion, setUploadVersion] = useState('');
  const [uploading, setUploading] = useState(false);

  // Deploy server state
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [selectedBuildId, setSelectedBuildId] = useState('');
  const [deploying, setDeploying] = useState(false);

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);

      const [projectData, buildsData, serversData] = await Promise.all([
        api.getProject(projectId),
        api.getBuilds(projectId),
        api.getServers(projectId),
      ]);

      setProject(projectData);
      setBuilds(buildsData);
      setServers(serversData);
    } catch (err: any) {
      console.error('Error loading project:', err);
      setError(err.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadBuild = async () => {
    if (!uploadFile || !uploadVersion.trim() || !projectId) {
      alert('Please select a file and enter a version');
      return;
    }

    try {
      setUploading(true);
      await api.uploadBuild(projectId, uploadFile, uploadVersion.trim());

      // Reload builds
      const buildsData = await api.getBuilds(projectId);
      setBuilds(buildsData);

      // Close modal and reset
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadVersion('');
    } catch (err: any) {
      console.error('Error uploading build:', err);
      alert(err.response?.data?.message || 'Failed to upload build');
    } finally {
      setUploading(false);
    }
  };

  const handleDeployServer = async () => {
    if (!selectedBuildId || !projectId) {
      alert('Please select a build');
      return;
    }

    try {
      setDeploying(true);
      await api.deployServer(projectId, selectedBuildId, 'us-east-1');

      // Reload servers
      const serversData = await api.getServers(projectId);
      setServers(serversData);

      // Close modal and reset
      setShowDeployModal(false);
      setSelectedBuildId('');
    } catch (err: any) {
      console.error('Error deploying server:', err);
      alert(err.response?.data?.message || 'Failed to deploy server');
    } finally {
      setDeploying(false);
    }
  };

  const handleStopServer = async (serverId: string) => {
    if (!projectId) return;
    if (!confirm('Are you sure you want to stop this server?')) return;

    try {
      await api.stopServer(projectId, serverId);

      // Reload servers
      const serversData = await api.getServers(projectId);
      setServers(serversData);
    } catch (err: any) {
      console.error('Error stopping server:', err);
      alert(err.response?.data?.message || 'Failed to stop server');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading project...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="error-screen">
        <h2>Error</h2>
        <p>{error || 'Project not found'}</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="project-detail">
      {/* Header */}
      <header className="project-header">
        <div className="container">
          <div className="header-left">
            <button onClick={() => navigate('/dashboard')} className="btn-back">
              ← Back
            </button>
            <div>
              <h1>{project.name}</h1>
              {project.description && <p className="project-description">{project.description}</p>}
            </div>
          </div>
          <div className="header-actions">
            <span className="user-email">{user?.email}</span>
            <LanguageSwitcher />
            <button onClick={handleLogout} className="btn-logout">
              {t('auth.logout', { defaultValue: 'Logout' })}
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="container">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`tab ${activeTab === 'builds' ? 'active' : ''}`}
              onClick={() => setActiveTab('builds')}
            >
              Builds ({builds.length})
            </button>
            <button
              className={`tab ${activeTab === 'servers' ? 'active' : ''}`}
              onClick={() => setActiveTab('servers')}
            >
              Servers ({servers.length})
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <main className="tab-content">
        <div className="container">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Builds</h3>
                  <p className="stat-value">{builds.length}</p>
                </div>
                <div className="stat-card">
                  <h3>Active Servers</h3>
                  <p className="stat-value">
                    {servers.filter(s => s.status === 'running').length}
                  </p>
                </div>
                <div className="stat-card">
                  <h3>Created</h3>
                  <p className="stat-value-small">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="action-buttons">
                  <button
                    className="btn-primary"
                    onClick={() => setShowUploadModal(true)}
                  >
                    📦 Upload Build
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => setShowDeployModal(true)}
                    disabled={builds.length === 0}
                  >
                    🚀 Deploy Server
                  </button>
                </div>
                {builds.length === 0 && (
                  <p className="help-text">
                    Upload a build first before deploying a server
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Builds Tab */}
          {activeTab === 'builds' && (
            <div className="builds-tab">
              <div className="tab-header">
                <h2>Builds</h2>
                <button
                  className="btn-primary"
                  onClick={() => setShowUploadModal(true)}
                >
                  Upload Build
                </button>
              </div>

              {builds.length === 0 ? (
                <div className="empty-state">
                  <h3>No builds yet</h3>
                  <p>Upload your first Unity server build to get started</p>
                  <button
                    className="btn-primary"
                    onClick={() => setShowUploadModal(true)}
                  >
                    Upload Build
                  </button>
                </div>
              ) : (
                <div className="builds-list">
                  {builds.map((build) => (
                    <div key={build.id} className="build-card">
                      <div className="build-info">
                        <h3>Version {build.version}</h3>
                        <span className={`status-badge ${build.status.toLowerCase()}`}>
                          {build.status}
                        </span>
                      </div>
                      <div className="build-meta">
                        <small>
                          Uploaded: {new Date(build.createdAt).toLocaleString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Servers Tab */}
          {activeTab === 'servers' && (
            <div className="servers-tab">
              <div className="tab-header">
                <h2>Servers</h2>
                <button
                  className="btn-primary"
                  onClick={() => setShowDeployModal(true)}
                  disabled={builds.length === 0}
                >
                  Deploy Server
                </button>
              </div>

              {servers.length === 0 ? (
                <div className="empty-state">
                  <h3>No servers running</h3>
                  <p>Deploy your first server to start accepting connections</p>
                  <button
                    className="btn-primary"
                    onClick={() => setShowDeployModal(true)}
                    disabled={builds.length === 0}
                  >
                    Deploy Server
                  </button>
                  {builds.length === 0 && (
                    <p className="help-text">
                      You need to upload a build first
                    </p>
                  )}
                </div>
              ) : (
                <div className="servers-list">
                  {servers.map((server) => (
                    <div key={server.id} className="server-card">
                      <div className="server-header">
                        <h3>Server {server.id.slice(0, 8)}</h3>
                        <span className={`status-badge ${server.status.toLowerCase()}`}>
                          {server.status}
                        </span>
                      </div>
                      <div className="server-details">
                        {server.ip && server.port && (
                          <div className="connection-info">
                            <strong>Connection:</strong> {server.ip}:{server.port}
                          </div>
                        )}
                        <div className="server-meta">
                          <small>
                            Created: {new Date(server.createdAt).toLocaleString()}
                          </small>
                          {server.lastHeartbeat && (
                            <small>
                              Last heartbeat:{' '}
                              {new Date(server.lastHeartbeat).toLocaleString()}
                            </small>
                          )}
                        </div>
                      </div>
                      <div className="server-actions">
                        <button
                          className="btn-danger"
                          onClick={() => handleStopServer(server.id)}
                          disabled={server.status === 'stopped'}
                        >
                          Stop Server
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Upload Build Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Build</h2>
              <button className="modal-close" onClick={() => setShowUploadModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="version">Version</label>
                <input
                  id="version"
                  type="text"
                  className="form-input"
                  value={uploadVersion}
                  onChange={(e) => setUploadVersion(e.target.value)}
                  placeholder="1.0.0"
                  disabled={uploading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="file">Build File (.zip or .tar.gz)</label>
                <input
                  id="file"
                  type="file"
                  className="form-input"
                  accept=".zip,.tar.gz"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  disabled={uploading}
                />
                {uploadFile && (
                  <small className="file-info">
                    Selected: {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                  </small>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleUploadBuild}
                disabled={uploading || !uploadFile || !uploadVersion.trim()}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deploy Server Modal */}
      {showDeployModal && (
        <div className="modal-overlay" onClick={() => setShowDeployModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Deploy Server</h2>
              <button className="modal-close" onClick={() => setShowDeployModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="build">Select Build</label>
                <select
                  id="build"
                  className="form-input"
                  value={selectedBuildId}
                  onChange={(e) => setSelectedBuildId(e.target.value)}
                  disabled={deploying}
                >
                  <option value="">-- Select a build --</option>
                  {builds
                    .filter((b) => b.status === 'ready')
                    .map((build) => (
                      <option key={build.id} value={build.id}>
                        Version {build.version}
                      </option>
                    ))}
                </select>
              </div>
              <p className="help-text">
                This will deploy a new server instance with the selected build
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowDeployModal(false)}
                disabled={deploying}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleDeployServer}
                disabled={deploying || !selectedBuildId}
              >
                {deploying ? 'Deploying...' : 'Deploy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
