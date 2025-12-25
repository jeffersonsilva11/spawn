# Indie Unity Game Backend Platform (MVP)

> **Backend infrastructure and runtime automation for indie Unity multiplayer games**

This platform allows indie game developers to upload Unity headless server builds, deploy multiplayer servers automatically, and manage everything through a simple web panel. No AWS knowledge required.

## 🎯 What This Platform Does

- **Upload** Unity server builds via web panel
- **Deploy** multiplayer servers automatically in Docker containers
- **Connect** Unity clients (PC, Android, iOS) using a simple SDK
- **Manage** servers, projects, and builds through a web interface
- **Scale** up to 1000 concurrent servers on a single EC2 instance

## 🏗️ Architecture

```
Unity Client (PC/Mobile)
    ↓ (Unity SDK)
Backend API (NestJS)
    ↓ (Private HTTP + Shared Secret)
Orchestrator (Node.js + Docker)
    ↓ (Docker API)
Unity Server Containers (Docker)
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## 📦 Repository Structure

```
spawn/
├── packages/
│   ├── backend/              # NestJS Backend API
│   ├── orchestrator/         # Docker orchestration service
│   ├── web-panel/            # React developer portal
│   └── unity-sdk/            # Unity client SDK
├── unity-server-template/    # Example Unity headless server
├── docs/                     # Documentation
├── scripts/                  # Setup and deployment scripts
└── docker-compose.yml        # Local development setup
```

## 🚀 Quick Start (Local Development)

### Prerequisites

- **Node.js 18+** - Para rodar os apps localmente
- **Docker Desktop** - Apenas para PostgreSQL (deve estar rodando)
- **Unity 2022 LTS+** - Apenas para criar builds de servidor

### Setup Completo em 1 Comando

```bash
# 1. Clone o repositório
git clone <repository-url>
cd spawn

# 2. Execute o script de setup (faz TUDO automaticamente)
./scripts/dev-setup.sh
```

**O script faz automaticamente:**
- ✅ Cria todos os arquivos `.env` (backend, orchestrator, web-panel)
- ✅ Instala todas as dependências npm
- ✅ Inicia PostgreSQL no Docker
- ✅ Verifica que tudo está funcionando
- ✅ Mostra os próximos passos

### Rodar Apps Localmente (Hot-Reload)

Depois do setup, abra **3 terminais** e execute:

```bash
# Terminal 1 - Backend
cd packages/backend
npm run start:dev

# Terminal 2 - Orchestrator
cd packages/orchestrator
npm run start:dev

# Terminal 3 - Web Panel
cd packages/web-panel
npm run dev
```

### Acessar

- **Web Panel:** http://localhost:3002
- **Backend API:** http://localhost:3000/health
- **Orchestrator:** http://localhost:3001/health
- **PostgreSQL:** localhost:5432

### Comandos Úteis

```bash
# Parar PostgreSQL
docker-compose -f docker-compose.dev.yml down

# Ver logs do PostgreSQL
docker-compose -f docker-compose.dev.yml logs -f postgres

# Resetar banco de dados (⚠️ apaga tudo)
docker-compose -f docker-compose.dev.yml down -v
./scripts/dev-setup.sh
```

### Por que essa abordagem?

📖 **Abordagem Híbrida (Recomendada para DEV)**
- ⚡ **Hot-reload instantâneo** - Mudanças aparecem sem rebuild
- 🐛 **Debugging fácil** - Breakpoints funcionam normalmente
- 📝 **Logs claros** - Output direto no terminal
- 🚀 **Desenvolvimento rápido** - Sem overhead de containers

Para produção, usamos Docker completo. Veja [docs/development-approaches.md](./docs/development-approaches.md) para comparação detalhada.

### Problemas?

Veja [docs/local-development.md](./docs/local-development.md) para troubleshooting detalhado.

## 🔑 Key Features

### Multi-Tenant
- Each studio has isolated projects and servers
- API key-based SDK authentication
- No cross-tenant access

### Clean Architecture
- Domain-driven design
- Framework-agnostic business logic
- Testable and maintainable

### Security
- JWT authentication for web panel
- API keys for Unity SDK
- Shared secret for internal services
- Non-root container execution
- Resource limits per server

### Docker-Based
- Automatic server lifecycle management
- Health monitoring via heartbeats
- Port allocation (7000-8000)
- Resource limits (CPU, memory)

## 📚 Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Setup Guide](./docs/setup.md)
- [Unity Server Build Guide](./docs/unity-server-guide.md)
- [Unity SDK Integration Guide](./docs/unity-sdk-guide.md)
- [API Reference](./docs/api-reference.md)

## 🛠️ Technology Stack

### Backend
- **Backend API:** NestJS, TypeScript, TypeORM, PostgreSQL, JWT
- **Orchestrator:** Node.js, Express, TypeScript, Docker CLI
- **Storage:** AWS S3 (builds), PostgreSQL (data)

### Frontend
- **Web Panel:** React, TypeScript, Axios, React Router

### Unity
- **Server:** Unity 2022 LTS, Mirror Networking, Linux Headless
- **SDK:** Unity C#, UnityWebRequest

### Infrastructure
- **Containers:** Docker, Docker Compose
- **Cloud:** AWS (EC2, RDS, S3)

## 🔐 Security Model

### Authentication Flows

1. **Web Panel → Backend:** JWT tokens
2. **Unity SDK → Backend:** API keys (per studio)
3. **Backend → Orchestrator:** Shared secret (internal)

### Container Security

- Run as non-root user (uid 1000)
- No privileged mode
- CPU limit: 1 core
- Memory limit: 2GB
- Only assigned port exposed
- Read-only root filesystem

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - Create studio + user
- `POST /auth/login` - Login

### Projects
- `POST /projects` - Create project
- `GET /projects` - List projects

### Builds
- `POST /projects/:id/builds` - Upload build

### Servers
- `POST /projects/:id/deploy` - Deploy server
- `GET /servers` - List servers
- `DELETE /servers/:id` - Stop server

### SDK
- `GET /sdk/projects/:id/server` - Get/create server

See [API Reference](./docs/api-reference.md) for complete documentation.

## 🎮 Example Workflow

### 1. Developer Setup
```bash
# Register studio
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@studio.com","password":"secret","studioName":"MyStudio"}'

# Create project
curl -X POST http://localhost:3000/projects \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"MyGame","description":"Awesome multiplayer game"}'
```

### 2. Upload Unity Server Build
```bash
# Build Unity server (Linux Headless)
# Upload via web panel or API
curl -X POST http://localhost:3000/projects/$PROJECT_ID/builds \
  -H "Authorization: Bearer $TOKEN" \
  -F "build=@server-build.zip" \
  -F "version=1.0.0"
```

### 3. Deploy Server
```bash
curl -X POST http://localhost:3000/projects/$PROJECT_ID/deploy \
  -H "Authorization: Bearer $TOKEN"
# Returns: { serverId, ip, port }
```

### 4. Unity Client Connection
```csharp
// In Unity client
await GameBackend.Initialize("your-api-key", "http://api.example.com");
ServerInfo server = await GameBackend.GetOrCreateServer("project-id");

NetworkManager.singleton.networkAddress = server.ip;
NetworkManager.singleton.GetComponent<TelepathyTransport>().port = server.port;
NetworkManager.singleton.StartClient();
```

## 🧪 Testing

```bash
# Backend tests
cd packages/backend
npm test

# Orchestrator tests
cd packages/orchestrator
npm test

# Integration tests
npm run test:integration
```

## 🚀 AWS Deployment

### Prerequisites
- AWS account
- EC2 instance (t3.medium or larger)
- RDS PostgreSQL instance
- S3 bucket for builds

### Deployment

See [docs/setup.md](./docs/setup.md) for detailed AWS deployment instructions.

Quick deploy:
```bash
./scripts/deploy-aws.sh
```

## ⚠️ MVP Limitations

This is an MVP with the following limitations:

- **Single EC2 instance** - No high availability
- **1000 concurrent servers max** - Port range constraint
- **No auto-scaling** - Manual resource management
- **Basic health monitoring** - Heartbeat only
- **No CDN** - Direct downloads
- **No analytics** - Manual monitoring
- **No matchmaking** - Developers implement their own

## 🗺️ Roadmap (Post-MVP)

- [ ] Auto-scaling based on demand
- [ ] Multi-region deployments
- [ ] Kubernetes migration
- [ ] Advanced monitoring and logging
- [ ] Matchmaking service
- [ ] Usage-based billing
- [ ] Built-in analytics
- [ ] DDoS protection

## 🤝 Contributing

This is an MVP built for indie developers. Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

- **Documentation:** See `/docs` folder
- **Issues:** GitHub Issues
- **Questions:** Open a discussion

## 🎯 Non-Goals

This platform explicitly does NOT provide:

❌ Game marketplace or distribution
❌ Matchmaking systems
❌ Social features (chat, friends, rankings)
❌ Anti-cheat systems
❌ Payment processing
❌ Game analytics
❌ Steam-like features

## 📝 Notes for Indie Developers

### What You Get
✅ Simple server deployment
✅ Automatic lifecycle management
✅ Easy Unity integration
✅ Multi-platform support (PC, Mobile)
✅ No AWS knowledge required

### What You Build
🔨 Game logic
🔨 Matchmaking (if needed)
🔨 Player progression
🔨 Game-specific features

This platform handles infrastructure so you can focus on building great games.

---

**Built with ❤️ for indie game developers**
