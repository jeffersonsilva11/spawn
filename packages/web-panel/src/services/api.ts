/**
 * API Service - Backend Communication
 * Handles all HTTP requests to the backend API
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests if available
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle response errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Health Check
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }

  // Authentication
  async register(data: { email: string; password: string; studioName: string }) {
    const response = await this.client.post('/auth/register', data);
    if (response.data.access_token) {
      localStorage.setItem('auth_token', response.data.access_token);
    }
    return response.data;
  }

  async login(data: { email: string; password: string }) {
    const response = await this.client.post('/auth/login', data);
    if (response.data.access_token) {
      localStorage.setItem('auth_token', response.data.access_token);
    }
    return response.data;
  }

  logout() {
    localStorage.removeItem('auth_token');
  }

  // Projects
  async getProjects() {
    const response = await this.client.get('/projects');
    return response.data.projects || [];
  }

  async createProject(data: { name: string; description?: string }) {
    const response = await this.client.post('/projects', data);
    return response.data.project;
  }

  async getProject(projectId: string) {
    const response = await this.client.get(`/projects/${projectId}`);
    return response.data.project;
  }

  // Builds
  async getBuilds(projectId: string) {
    const response = await this.client.get(`/projects/${projectId}/builds`);
    return response.data.builds || [];
  }

  async uploadBuild(projectId: string, file: File, version: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('version', version);

    const response = await this.client.post(
      `/projects/${projectId}/builds`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  // Servers
  async getServers(projectId: string) {
    const response = await this.client.get('/servers');
    return response.data.servers || [];
  }

  async deployServer(projectId: string, buildId: string, region: string) {
    const response = await this.client.post(`/projects/${projectId}/servers`, {
      buildId,
      region,
    });
    return response.data;
  }

  async stopServer(projectId: string, serverId: string) {
    const response = await this.client.delete(
      `/projects/${projectId}/servers/${serverId}`
    );
    return response.data;
  }

  async getOrCreateServer(projectId: string, buildId: string, region: string) {
    const response = await this.client.post(
      `/projects/${projectId}/servers/get-or-create`,
      {
        buildId,
        region,
      }
    );
    return response.data;
  }

  // Stats
  async getStats() {
    const response = await this.client.get('/stats');
    return response.data;
  }
}

export const api = new ApiService();
export default api;
