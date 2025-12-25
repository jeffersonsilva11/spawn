# Game Backend Web Panel

Developer web portal for managing game projects, builds, and servers.

## Overview

The web panel provides a user-friendly interface for:

- Studio registration and authentication
- Project management
- Build uploads
- Server deployment and monitoring
- API key management

## Technology Stack

**Recommended Stack:**
- React 18+ with TypeScript
- React Router for navigation
- Axios for API calls
- Tailwind CSS or Material-UI for styling
- React Query for data fetching

## Quick Start

### Using Create React App

```bash
cd packages/web-panel

# Create React app
npx create-react-app . --template typescript

# Install dependencies
npm install axios react-router-dom react-query

# Start development server
npm start
```

### Using Vite (Recommended)

```bash
cd packages/web-panel

# Create Vite app
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install
npm install axios react-router-dom @tanstack/react-query

# Start development server
npm run dev
```

## Features to Implement

### 1. Authentication

- `/register` - Studio registration
- `/login` - User login
- JWT token management in localStorage
- Protected routes

### 2. Dashboard

- Overview of projects and servers
- Quick stats (active servers, total projects)
- Recent activity

### 3. Projects

- `/projects` - List all projects
- `/projects/new` - Create new project
- `/projects/:id` - Project details
  - List builds
  - Upload new build
  - Deploy server
  - View running servers

### 4. Servers

- `/servers` - List all running servers
- Server cards with:
  - IP and Port
  - Status indicator
  - Last heartbeat
  - Stop button

### 5. Settings

- `/settings` - Studio settings
- Display API key
- Update studio info
- User management

## API Integration Example

### Create API Client

`src/services/api.ts`:

```typescript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  register: (data: RegisterData) =>
    apiClient.post('/auth/register', data),

  login: (data: LoginData) =>
    apiClient.post('/auth/login', data),
};

export const projects = {
  list: () => apiClient.get('/projects'),

  create: (data: CreateProjectData) =>
    apiClient.post('/projects', data),

  get: (id: string) =>
    apiClient.get(`/projects/${id}`),
};

export const servers = {
  list: () => apiClient.get('/servers'),

  deploy: (projectId: string, buildId?: string) =>
    apiClient.post(`/servers/projects/${projectId}/deploy`, { buildId }),

  stop: (serverId: string) =>
    apiClient.delete(`/servers/${serverId}`),
};

export default apiClient;
```

### Example Component

`src/pages/Projects.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import { projects } from '../services/api';

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export const Projects: React.FC = () => {
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await projects.list();
      setProjectList(response.data.projects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Projects</h1>
      {projectList.map((project) => (
        <div key={project.id}>
          <h2>{project.name}</h2>
          <p>{project.description}</p>
        </div>
      ))}
    </div>
  );
};
```

## Environment Variables

`.env`:

```env
REACT_APP_API_URL=http://localhost:3000
```

## Deployment

### Build for Production

```bash
npm run build
```

### Docker

`Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Resources

- [React Documentation](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [API Reference](../../docs/api-reference.md)

## License

MIT
