# Indie Unity Game Backend Platform - Architecture

## Overview

This platform provides backend infrastructure and runtime automation for indie Unity multiplayer games. It allows developers to upload Unity server builds, deploy them automatically, and manage everything through a simple web panel.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS Cloud                                │
│                                                                   │
│  ┌──────────────────┐         ┌─────────────────────────────┐  │
│  │   S3 Bucket      │         │   RDS PostgreSQL             │  │
│  │  (Server Builds) │         │   (Platform Data)            │  │
│  └────────┬─────────┘         └──────────┬──────────────────┘  │
│           │                               │                      │
│  ┌────────▼─────────────────────────────▼─────────────────┐   │
│  │           Backend API (NestJS)                          │   │
│  │  - Authentication (JWT)                                 │   │
│  │  - Project Management                                   │   │
│  │  - Build Registration                                   │   │
│  │  - Server Lifecycle Control                             │   │
│  │  Port: 3000 (Public)                                    │   │
│  └────────┬────────────────────────────────────────────────┘   │
│           │ HTTP + Shared Secret                                │
│  ┌────────▼─────────────────────────────────────────────────┐  │
│  │      Orchestrator Service (Node.js)                      │  │
│  │  - Docker Container Management                           │  │
│  │  - Port Allocation (7000-8000)                          │  │
│  │  - Health Monitoring                                     │  │
│  │  - Container Lifecycle                                   │  │
│  │  Port: 3001 (Private - NOT publicly accessible)         │  │
│  └────────┬─────────────────────────────────────────────────┘  │
│           │ Docker API                                          │
│  ┌────────▼─────────────────────────────────────────────────┐  │
│  │         Docker Engine                                    │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │ Unity Server │  │ Unity Server │  │ Unity Server │  │  │
│  │  │ Container 1  │  │ Container 2  │  │ Container N  │  │  │
│  │  │ Port: 7000   │  │ Port: 7001   │  │ Port: 700N   │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Client Side                                 │
│                                                                   │
│  ┌──────────────────┐                                            │
│  │  Web Panel       │──HTTP──▶ Backend API                      │
│  │  (React)         │                                            │
│  └──────────────────┘                                            │
│                                                                   │
│  ┌──────────────────┐                                            │
│  │  Unity Client    │──Unity SDK──▶ Backend API ──▶ Get IP:Port │
│  │  (PC/Mobile)     │──Direct UDP──▶ Unity Server Container     │
│  └──────────────────┘                                            │
└─────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

### 1. Backend API (NestJS)
**Port:** 3000 (Public)
**Tech Stack:** Node.js, NestJS, TypeScript, TypeORM, PostgreSQL

**Responsibilities:**
- User and studio authentication (JWT)
- Project and build management
- Server deployment requests
- API key management for Unity SDK
- Multi-tenant isolation
- Communication with Orchestrator

**Clean Architecture Layers:**
```
backend/src/
├── domain/              # Business entities and rules
│   ├── entities/
│   ├── value-objects/
│   └── interfaces/
├── application/         # Use cases and business logic
│   ├── use-cases/
│   └── dto/
├── infrastructure/      # External services
│   ├── database/
│   ├── storage/        # S3
│   ├── orchestrator/   # HTTP client
│   └── auth/
└── interfaces/          # Controllers and API
    ├── http/
    └── middleware/
```

### 2. Orchestrator Service (Node.js)
**Port:** 3001 (Private - Internal Only)
**Tech Stack:** Node.js, Express, TypeScript, Docker CLI

**Responsibilities:**
- Manage Docker containers for Unity servers
- Port allocation and tracking (7000-8000)
- Container lifecycle (start, stop, remove)
- Health monitoring and heartbeat tracking
- Resource limits enforcement
- Private API for Backend only

**Security:**
- NOT publicly accessible
- Authenticated via shared secret
- Only accepts requests from Backend API

### 3. Unity Headless Server Template
**Tech Stack:** Unity 2022 LTS, Mirror Networking, C#

**Features:**
- Headless build configuration
- Environment variable support
- Heartbeat system
- Example multiplayer scene
- Dockerfile for containerization

### 4. Unity SDK
**Tech Stack:** Unity C#, UnityWebRequest

**API Surface:**
```csharp
// Anonymous authentication
await GameBackend.Initialize(apiKey, apiUrl);

// Fetch server
ServerInfo server = await GameBackend.GetOrCreateServer(projectId);

// Connect
NetworkManager.singleton.networkAddress = server.ip;
NetworkManager.singleton.GetComponent<TelepathyTransport>().port = server.port;
NetworkManager.singleton.StartClient();
```

### 5. Web Panel (React)
**Port:** 3002 (Public)
**Tech Stack:** React, TypeScript, Axios, React Router

**Features:**
- Studio and user management
- Project creation
- Build upload
- Server deployment
- Server monitoring
- Usage statistics

## Data Model

### Multi-Tenant Hierarchy
```
Studio (1) ──── (N) User
   │
   └── (N) Project
         │
         ├── (N) Build
         │
         └── (N) ServerInstance
```

### Core Entities

**User**
- id (UUID)
- email (unique)
- passwordHash
- studioId (FK)

**Studio**
- id (UUID)
- name
- apiKey (unique, for SDK)
- maxServers (limit)
- createdAt

**Project**
- id (UUID)
- studioId (FK)
- name
- description
- activeBuilds[]

**Build**
- id (UUID)
- projectId (FK)
- version
- s3Key (path to build)
- dockerImage (generated)
- createdAt

**ServerInstance**
- id (UUID)
- projectId (FK)
- buildId (FK)
- status (starting, running, stopping, stopped)
- containerId (Docker)
- ip (public IP)
- port (assigned port)
- lastHeartbeat
- createdAt

## Security Model

### Authentication Flows

**1. Web Panel ↔ Backend**
- JWT tokens
- Login: POST /auth/login → { accessToken, refreshToken }
- Attach: Authorization: Bearer {token}

**2. Unity SDK ↔ Backend**
- API Key per Studio
- Attach: X-API-Key: {studioApiKey}
- Scoped to studio's projects only

**3. Backend ↔ Orchestrator**
- Shared secret in environment
- Attach: X-Orchestrator-Secret: {secret}
- Internal network only

### Multi-Tenant Isolation

All queries MUST filter by studio:
```typescript
// Example: Get servers
const servers = await serverRepository.find({
  where: {
    project: {
      studioId: user.studioId
    }
  }
});
```

### Container Security

Unity server containers:
- Run as non-root user
- No privileged mode
- CPU limit: 1 core
- Memory limit: 2GB
- Only expose assigned port
- Read-only root filesystem (except /tmp)

## Port Allocation Strategy

**Backend API:** 3000
**Orchestrator:** 3001 (internal)
**Web Panel:** 3002
**Unity Servers:** 7000-8000 (1000 concurrent max)

Orchestrator tracks available ports in memory:
```typescript
availablePorts: Set<number> = new Set([7000...8000]);
```

## Deployment Topology

### Local Development
```
docker-compose up
  - postgres (5432)
  - backend (3000)
  - orchestrator (3001)
  - web-panel (3002)
```

### AWS Production (Single EC2)
```
EC2 Instance:
  - Docker Engine
  - Backend API (container)
  - Orchestrator (container)
  - Web Panel (container)
  - Unity Servers (containers)
  - PostgreSQL (RDS)
  - S3 (builds)
```

## API Endpoints (Minimal Set)

### Authentication
- `POST /auth/register` - Create studio + admin user
- `POST /auth/login` - JWT login

### Projects
- `POST /projects` - Create project
- `GET /projects` - List studio projects
- `GET /projects/:id` - Get project details

### Builds
- `POST /projects/:id/builds` - Upload build to S3
- `GET /builds/:id` - Get build info

### Servers
- `POST /projects/:id/deploy` - Deploy server
- `GET /servers` - List studio servers
- `GET /servers/:id` - Get server details
- `POST /servers/:id/heartbeat` - Heartbeat from Unity server
- `DELETE /servers/:id` - Stop server

### SDK (Public)
- `POST /sdk/auth` - Anonymous/API key auth
- `GET /sdk/projects/:id/server` - Get or create server for project

## Orchestrator API (Private)

- `POST /containers/start` - Start Unity server container
- `DELETE /containers/:id` - Stop container
- `GET /containers` - List running containers
- `POST /containers/:id/health` - Update health status

## Technology Decisions

### Why NestJS?
- Built-in dependency injection (Clean Architecture)
- TypeScript-first
- Excellent structure for use cases
- Great testing support

### Why Docker?
- Isolation for Unity servers
- Resource limits
- Easy deployment
- Process management

### Why PostgreSQL?
- ACID compliance
- Relational data (Studio → Project → Server)
- TypeORM integration

### Why S3?
- Reliable build storage
- Scalable
- Pre-signed URLs for uploads

### Why Mirror?
- Simple Unity networking
- Open source
- Good for indie games
- Works on all platforms

## Non-Goals (Explicitly Out of Scope)

❌ Kubernetes or container orchestration
❌ Multi-region deployments
❌ Matchmaking systems
❌ Game marketplace
❌ Payment processing
❌ Anti-cheat
❌ Social features
❌ Analytics dashboards
❌ Auto-scaling

## MVP Limitations

1. **Single EC2 instance** - No high availability
2. **1000 server limit** - Port range constraint
3. **No auto-scaling** - Manual container management
4. **Basic health checks** - Heartbeat only
5. **No CDN** - Direct S3 downloads
6. **No logging aggregation** - Container logs only
7. **No monitoring** - Manual status checks

## Success Metrics

The MVP is complete when:

✅ Unity server can be deployed via web panel
✅ Orchestrator successfully manages containers
✅ Clients connect using IP + port from SDK
✅ Heartbeats control server lifecycle
✅ Panel reflects real server state
✅ No manual intervention required

## Next Steps After MVP

1. Auto-scaling based on player count
2. Multi-region support
3. Load balancer for backend
4. Monitoring and alerting
5. Log aggregation
6. Kubernetes migration
7. Matchmaking system
8. Usage-based billing
