# API Reference - Game Backend Platform

Complete REST API documentation for the Game Backend Platform.

## Base URL

- **Local Development:** `http://localhost:3000`
- **Production:** `https://api.yourdomain.com`

## Authentication

The platform uses two authentication methods:

### JWT Authentication (Web Panel)

Used for studio admin operations.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Get Token:**
```bash
POST /auth/login
```

### API Key Authentication (Unity SDK)

Used for game client operations.

**Headers:**
```
X-API-Key: <studio-api-key>
```

**Get API Key:** Register studio or check web panel settings.

---

## Endpoints

### Authentication

#### Register Studio

Create a new studio account.

```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "admin@mystudio.com",
  "password": "securepassword123",
  "studioName": "My Game Studio"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "user-uuid",
    "email": "admin@mystudio.com"
  },
  "studio": {
    "id": "studio-uuid",
    "name": "My Game Studio",
    "apiKey": "gbk_a1b2c3d4e5f6..."
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Login

Authenticate and get JWT token.

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "admin@mystudio.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "user-uuid",
    "email": "admin@mystudio.com"
  },
  "studioId": "studio-uuid",
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### Projects

Requires JWT authentication.

#### Create Project

```http
POST /projects
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "My Awesome Game",
  "description": "A multiplayer battle royale game"
}
```

**Response:** `201 Created`
```json
{
  "project": {
    "id": "project-uuid",
    "name": "My Awesome Game",
    "description": "A multiplayer battle royale game",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### List Projects

```http
GET /projects
Authorization: Bearer <jwt-token>
```

**Response:** `200 OK`
```json
{
  "projects": [
    {
      "id": "project-uuid",
      "name": "My Awesome Game",
      "description": "A multiplayer battle royale game",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Get Project

```http
GET /projects/:id
Authorization: Bearer <jwt-token>
```

**Response:** `200 OK`
```json
{
  "project": {
    "id": "project-uuid",
    "name": "My Awesome Game",
    "description": "A multiplayer battle royale game",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### Builds

Requires JWT authentication.

#### Upload Build

```http
POST /projects/:projectId/builds
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Form Data:**
- `version`: `string` - Build version (e.g., "1.0.0")
- `build`: `file` - Build archive (.tar.gz, .zip)

**Example:**
```bash
curl -X POST http://localhost:3000/projects/project-uuid/builds \
  -H "Authorization: Bearer $TOKEN" \
  -F "version=1.0.0" \
  -F "build=@server-build.tar.gz"
```

**Response:** `201 Created`
```json
{
  "build": {
    "id": "build-uuid",
    "projectId": "project-uuid",
    "version": "1.0.0",
    "status": "ready"
  }
}
```

#### List Builds

```http
GET /projects/:projectId/builds
Authorization: Bearer <jwt-token>
```

**Response:** `200 OK`
```json
{
  "builds": [
    {
      "id": "build-uuid",
      "version": "1.0.0",
      "status": "ready",
      "createdAt": "2024-01-15T11:00:00Z"
    }
  ]
}
```

---

### Servers

#### Deploy Server

Start a new server instance.

```http
POST /servers/projects/:projectId/deploy
Authorization: Bearer <jwt-token>
```

**Request Body (Optional):**
```json
{
  "buildId": "build-uuid"  // If not provided, uses latest build
}
```

**Response:** `201 Created`
```json
{
  "server": {
    "id": "server-uuid",
    "projectId": "project-uuid",
    "buildId": "build-uuid",
    "status": "running",
    "ip": "54.123.45.67",
    "port": 7001
  }
}
```

#### List Servers

```http
GET /servers
Authorization: Bearer <jwt-token>
```

**Response:** `200 OK`
```json
{
  "servers": [
    {
      "id": "server-uuid",
      "projectId": "project-uuid",
      "buildId": "build-uuid",
      "status": "running",
      "ip": "54.123.45.67",
      "port": 7001,
      "lastHeartbeat": "2024-01-15T12:30:00Z",
      "createdAt": "2024-01-15T12:00:00Z"
    }
  ]
}
```

#### Get Server

```http
GET /servers/:id
Authorization: Bearer <jwt-token>
```

**Response:** `200 OK`
```json
{
  "server": {
    "id": "server-uuid",
    "projectId": "project-uuid",
    "buildId": "build-uuid",
    "status": "running",
    "ip": "54.123.45.67",
    "port": 7001,
    "containerId": "docker-container-id",
    "lastHeartbeat": "2024-01-15T12:30:00Z",
    "createdAt": "2024-01-15T12:00:00Z"
  }
}
```

#### Stop Server

```http
DELETE /servers/:id
Authorization: Bearer <jwt-token>
```

**Response:** `204 No Content`

#### Update Heartbeat

Called by Unity servers to indicate they're alive.

```http
POST /servers/:id/heartbeat
```

**No authentication required** - servers call this.

**Response:** `200 OK`
```json
{
  "serverId": "server-uuid",
  "lastHeartbeat": "2024-01-15T12:30:45Z"
}
```

---

### SDK Endpoints

Requires API Key authentication.

#### Get Server

Get an available server for a project (Unity SDK uses this).

```http
GET /sdk/projects/:projectId/server
X-API-Key: <studio-api-key>
```

**Response:** `200 OK`
```json
{
  "server": {
    "id": "server-uuid",
    "ip": "54.123.45.67",
    "port": 7001,
    "status": "running"
  }
}
```

**Error Response:** `404 Not Found`
```json
{
  "error": "Not Found",
  "message": "No available server found. Please deploy a server from the web panel."
}
```

---

### Health Check

Public endpoint for monitoring.

```http
GET /health
```

**Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T12:00:00Z"
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

### HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `204 No Content` - Success, no response body
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Common Errors

#### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing token"
}
```

#### 404 No Server Available

```json
{
  "error": "Not Found",
  "message": "No available server found. Please deploy a server from the web panel."
}
```

#### 400 Validation Error

```json
{
  "error": "Bad Request",
  "message": "Validation failed: email must be a valid email address"
}
```

---

## Rate Limiting

Currently no rate limiting in MVP. Will be added in future versions.

## Pagination

Currently no pagination. All list endpoints return all items. Will be added in future versions.

## Examples

### Complete Workflow (cURL)

```bash
# 1. Register studio
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mystudio.com",
    "password": "securepass123",
    "studioName": "My Studio"
  }'

# Save accessToken and apiKey from response

# 2. Create project
TOKEN="your-access-token"
curl -X POST http://localhost:3000/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Game",
    "description": "Awesome multiplayer game"
  }'

# Save projectId from response

# 3. Upload build
PROJECT_ID="your-project-id"
curl -X POST "http://localhost:3000/projects/$PROJECT_ID/builds" \
  -H "Authorization: Bearer $TOKEN" \
  -F "version=1.0.0" \
  -F "build=@server-build.tar.gz"

# 4. Deploy server
curl -X POST "http://localhost:3000/servers/projects/$PROJECT_ID/deploy" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Returns server IP and port

# 5. Get server from Unity SDK
API_KEY="your-studio-api-key"
curl -H "X-API-Key: $API_KEY" \
  "http://localhost:3000/sdk/projects/$PROJECT_ID/server"
```

### Unity C# Example

```csharp
// See Unity SDK Integration Guide for complete examples
using GameBackendSDK;

var client = new GameBackendClient(
    "http://localhost:3000",
    "your-api-key"
);

ServerInfo server = await client.GetServer("project-id");
Console.WriteLine($"Connect to: {server.Ip}:{server.Port}");
```

---

## Versioning

Current Version: **v1.0.0 (MVP)**

API versioning will be introduced in future releases.

---

## Support

- Issues: GitHub Issues
- Documentation: `/docs` folder
- API Status: `GET /health`
