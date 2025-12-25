# Setup Guide - Indie Unity Game Backend Platform

This guide covers local development setup and AWS deployment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [AWS Deployment](#aws-deployment)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Local Development

- **Node.js** 18+ and npm 9+
- **Docker** and Docker Compose
- **PostgreSQL** 15+ (via Docker)
- **Git**

### AWS Deployment

- AWS Account
- AWS CLI configured
- EC2 instance (t3.medium or larger, Ubuntu 22.04)
- RDS PostgreSQL instance
- S3 bucket for builds
- Security groups configured

## Local Development Setup

### 1. Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd spawn

# Install dependencies for all packages
npm install

# Or install individually
cd packages/backend && npm install
cd ../orchestrator && npm install
cd ../web-panel && npm install
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Minimum required configuration for local development:**

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=gamebackend
DB_PASSWORD=gamebackend_password
DB_NAME=gamebackend

# JWT
JWT_SECRET=your-secure-random-secret-change-this
JWT_REFRESH_SECRET=your-secure-refresh-secret-change-this

# Orchestrator
ORCHESTRATOR_SECRET=your-orchestrator-secret-change-this
ORCHESTRATOR_URL=http://localhost:3001

# AWS (use localstack or real credentials)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=unity-game-builds

# Server
PUBLIC_IP=localhost
```

### 3. Start Services with Docker Compose

```bash
# Start all services (Backend, Orchestrator, PostgreSQL, Web Panel)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Services will be available at:**

- Backend API: http://localhost:3000
- Orchestrator: http://localhost:3001 (internal)
- Web Panel: http://localhost:3002
- PostgreSQL: localhost:5432

### 4. Verify Installation

```bash
# Check backend health
curl http://localhost:3000/health

# Check orchestrator health
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","timestamp":"..."}
```

### 5. Create First Studio Account

```bash
# Register a studio
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mystudio.com",
    "password": "securepassword123",
    "studioName": "My Game Studio"
  }'

# Response will include API key for Unity SDK
```

## AWS Deployment

### Step 1: Prepare AWS Resources

#### 1.1 Create RDS PostgreSQL Instance

```bash
# Via AWS Console or CLI
aws rds create-db-instance \
  --db-instance-identifier gamebackend-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.3 \
  --master-username gamebackend \
  --master-user-password <secure-password> \
  --allocated-storage 20 \
  --vpc-security-group-ids <sg-id>
```

#### 1.2 Create S3 Bucket

```bash
aws s3 mb s3://unity-game-builds-<your-unique-id>

# Enable versioning (optional but recommended)
aws s3api put-bucket-versioning \
  --bucket unity-game-builds-<your-unique-id> \
  --versioning-configuration Status=Enabled
```

#### 1.3 Create EC2 Instance

**Instance Type:** t3.medium or larger
**OS:** Ubuntu 22.04 LTS
**Storage:** 50GB+ SSD

**Security Group Rules:**

- SSH (22) from your IP
- HTTP (80) from 0.0.0.0/0
- HTTPS (443) from 0.0.0.0/0
- Custom TCP (3000) from 0.0.0.0/0 (Backend API)
- Custom TCP (7000-8000) from 0.0.0.0/0 (Unity servers)

### Step 2: Configure EC2 Instance

SSH into your EC2 instance:

```bash
ssh -i your-key.pem ubuntu@<ec2-public-ip>
```

#### 2.1 Install Docker

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker --version
docker-compose --version
```

#### 2.2 Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

### Step 3: Deploy Application

#### 3.1 Clone Repository

```bash
git clone <repository-url>
cd spawn
```

#### 3.2 Configure Environment

```bash
# Create production environment file
cp .env.example .env.production

# Edit with production values
nano .env.production
```

**Production configuration:**

```env
NODE_ENV=production

# Backend
BACKEND_PORT=3000
BACKEND_HOST=0.0.0.0

# Database (RDS)
DB_HOST=<rds-endpoint>.rds.amazonaws.com
DB_PORT=5432
DB_USERNAME=gamebackend
DB_PASSWORD=<secure-password>
DB_NAME=gamebackend
DB_SYNCHRONIZE=true  # Set to false after first run
DB_LOGGING=false

# JWT (use strong random secrets)
JWT_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-strong-secret>

# Orchestrator
ORCHESTRATOR_SECRET=<generate-strong-secret>
ORCHESTRATOR_URL=http://orchestrator:3001

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
S3_BUCKET_NAME=unity-game-builds-<your-unique-id>

# Server
PUBLIC_IP=<ec2-public-ip>
MAX_SERVERS_PER_STUDIO=50

# Ports
UNITY_SERVER_PORT_RANGE_START=7000
UNITY_SERVER_PORT_RANGE_END=8000

# CORS
CORS_ORIGIN=https://your-panel-domain.com,http://<ec2-public-ip>:3002
```

#### 3.3 Build and Start Services

```bash
# Build Docker images
docker-compose build

# Start services
docker-compose -f docker-compose.yml --env-file .env.production up -d

# View logs
docker-compose logs -f
```

### Step 4: Setup Nginx Reverse Proxy (Optional but Recommended)

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/gamebackend
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Web Panel
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/gamebackend /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 5: Setup SSL with Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

### Step 6: Monitoring and Maintenance

```bash
# View all running containers
docker ps

# View backend logs
docker logs gamebackend-api -f

# View orchestrator logs
docker logs gamebackend-orchestrator -f

# Check disk usage
df -h

# Clean up old Docker images
docker system prune -a
```

## Configuration

### Environment Variables Reference

See `.env.example` for all available configuration options.

**Critical Security Settings:**

- `JWT_SECRET` - Must be strong random string in production
- `ORCHESTRATOR_SECRET` - Must be strong random string
- `DB_PASSWORD` - Strong database password
- `CORS_ORIGIN` - Restrict to your domain only

### Port Allocation

- **3000**: Backend API (public)
- **3001**: Orchestrator (internal only)
- **3002**: Web Panel (public)
- **7000-8000**: Unity server instances (public, UDP/TCP)

### Resource Limits

Default limits per Unity server container:

- CPU: 1 core
- Memory: 2GB
- Restart policy: unless-stopped

Adjust in `.env`:

```env
CONTAINER_CPU_LIMIT=1
CONTAINER_MEMORY_LIMIT=2g
```

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
docker exec -it gamebackend-postgres psql -U gamebackend

# Check if database exists
\l

# Check tables
\dt
```

### Docker Issues

```bash
# Remove all containers and start fresh
docker-compose down -v
docker-compose up --build

# Check Docker daemon
sudo systemctl status docker

# Restart Docker
sudo systemctl restart docker
```

### Port Already in Use

```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

### Orchestrator Cannot Start Containers

```bash
# Ensure Docker socket is accessible
ls -la /var/run/docker.sock

# Ensure orchestrator has access
docker exec -it gamebackend-orchestrator ls -la /var/run/docker.sock
```

### AWS S3 Access Issues

```bash
# Verify IAM permissions
aws s3 ls s3://your-bucket-name

# Test upload
echo "test" > test.txt
aws s3 cp test.txt s3://your-bucket-name/test.txt
```

### Unity Server Not Starting

```bash
# Check orchestrator logs
docker logs gamebackend-orchestrator -f

# Check available ports
docker exec gamebackend-orchestrator netstat -tuln

# Verify Docker image exists
docker images | grep unity-server
```

## Next Steps

- [Unity Server Build Guide](./unity-server-guide.md)
- [Unity SDK Integration](./unity-sdk-guide.md)
- [API Reference](./api-reference.md)

## Support

For issues and questions:

- GitHub Issues: <repository-url>/issues
- Documentation: <repository-url>/docs
