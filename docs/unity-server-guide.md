# Unity Headless Server Build Guide

This guide explains how to create a Unity headless server build that works with the Game Backend Platform.

## Overview

A Unity headless server is a build that runs without graphics, designed to run on Linux servers. It handles game logic, player synchronization, and communicates with the backend platform.

## Prerequisites

- Unity 2022 LTS or newer
- Linux Build Support module installed
- Mirror Networking or Unity Netcode (this guide uses Mirror)
- Basic understanding of Unity multiplayer

## Step 1: Project Setup

### 1.1 Create New Unity Project

```bash
# Unity Hub
Create New Project → 3D → Name: "MyGameServer"
```

### 1.2 Install Mirror Networking

```
Window → Package Manager → Add package by name
Name: com.mirror-networking.mirror
```

Or download from: https://github.com/MirrorNetworking/Mirror/releases

### 1.3 Install Linux Build Support

```
Unity Hub → Installs → Your Unity Version → Add Modules
Select: Linux Build Support (Mono)
```

## Step 2: Server Configuration

### 2.1 Create Server Manager Script

Create `Assets/Scripts/GameServerManager.cs`:

```csharp
using UnityEngine;
using Mirror;
using System;
using System.Collections;
using UnityEngine.Networking;

public class GameServerManager : MonoBehaviour
{
    [Header("Backend Configuration")]
    public string backendUrl = "http://localhost:3000";
    public string serverId;

    [Header("Server Configuration")]
    public int serverPort = 7777;
    public int maxPlayers = 10;

    private NetworkManager networkManager;
    private float heartbeatInterval = 30f; // 30 seconds

    void Start()
    {
        // Get configuration from environment variables
        serverId = Environment.GetEnvironmentVariable("SERVER_ID");

        string portEnv = Environment.GetEnvironmentVariable("SERVER_PORT");
        if (!string.IsNullOrEmpty(portEnv))
        {
            serverPort = int.Parse(portEnv);
        }

        // Configure network manager
        networkManager = GetComponent<NetworkManager>();
        if (networkManager != null)
        {
            Transport transport = Transport.active;

            // Set port (Mirror/Telepathy)
            if (transport is TelepathyTransport telepathy)
            {
                telepathy.port = (ushort)serverPort;
            }

            networkManager.maxConnections = maxPlayers;

            // Start server
            networkManager.StartServer();
            Debug.Log($"Server started on port {serverPort}");
        }

        // Start heartbeat
        StartCoroutine(SendHeartbeat());
    }

    IEnumerator SendHeartbeat()
    {
        while (true)
        {
            yield return new WaitForSeconds(heartbeatInterval);

            if (!string.IsNullOrEmpty(serverId))
            {
                StartCoroutine(SendHeartbeatRequest());
            }
        }
    }

    IEnumerator SendHeartbeatRequest()
    {
        string url = $"{backendUrl}/servers/{serverId}/heartbeat";

        using (UnityWebRequest request = UnityWebRequest.Post(url, ""))
        {
            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                Debug.Log("Heartbeat sent successfully");
            }
            else
            {
                Debug.LogError($"Heartbeat failed: {request.error}");
            }
        }
    }

    void OnApplicationQuit()
    {
        // Graceful shutdown
        if (networkManager != null)
        {
            networkManager.StopServer();
        }
    }
}
```

### 2.2 Setup Network Manager

1. Create empty GameObject: `Hierarchy → Right Click → Create Empty`
2. Name it: `NetworkManager`
3. Add components:
   - `Network Manager` (Mirror)
   - `Telepathy Transport` (Mirror)
   - `GameServerManager` (your script)

### 2.3 Configure Network Manager

**Network Manager component:**
- Network Address: `localhost`
- Max Connections: `10`
- Player Prefab: (assign your player prefab)
- Spawn Player Method: `Manual` or `Round Robin`

**Telepathy Transport:**
- Port: `7777` (will be overridden by env variable)
- Max Message Size: `16384`

## Step 3: Create Example Game Logic

### 3.1 Player Controller

Create `Assets/Scripts/PlayerController.cs`:

```csharp
using Mirror;
using UnityEngine;

public class PlayerController : NetworkBehaviour
{
    [Header("Movement")]
    public float moveSpeed = 5f;

    [SyncVar]
    public string playerName;

    void Update()
    {
        // Only process input for local player
        if (!isLocalPlayer) return;

        // Handle movement
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");

        Vector3 movement = new Vector3(horizontal, 0, vertical) * moveSpeed * Time.deltaTime;
        transform.Translate(movement);

        // Send position to server
        CmdMove(transform.position);
    }

    [Command]
    void CmdMove(Vector3 position)
    {
        // Server authoritative movement
        transform.position = position;
    }

    public override void OnStartServer()
    {
        base.OnStartServer();
        Debug.Log($"Player spawned on server: {netId}");
    }

    public override void OnStartClient()
    {
        base.OnStartClient();

        if (isLocalPlayer)
        {
            // Local player setup
            Camera.main.transform.SetParent(transform);
            Camera.main.transform.localPosition = new Vector3(0, 5, -10);
        }
    }
}
```

### 3.2 Create Player Prefab

1. Create Capsule: `GameObject → 3D Object → Capsule`
2. Name: `Player`
3. Add `NetworkIdentity` component
4. Add `PlayerController` script
5. Drag to `Prefabs` folder
6. Delete from scene
7. Assign to Network Manager's Player Prefab field

## Step 4: Build Configuration

### 4.1 Build Settings

```
File → Build Settings
Platform: Linux
Architecture: x86_64
Server Build: ✓ (IMPORTANT!)
```

### 4.2 Player Settings

```
Edit → Project Settings → Player

Product Name: MyGameServer
Company Name: MyStudio

Resolution and Presentation:
  Run In Background: ✓
  Display Resolution Dialog: Disabled
  Fullscreen Mode: Windowed
  Default Screen Width: 1024
  Default Screen Height: 768

Other Settings:
  Scripting Backend: Mono
  API Compatibility Level: .NET Standard 2.1
```

### 4.3 Quality Settings for Server

```
Edit → Project Settings → Quality

Delete all quality levels except one
Name it: "Server"
Settings:
  VSync Count: Don't Sync
  Texture Quality: Eighth Res
  Anisotropic Textures: Disabled
  Shadows: Disable
  Anti Aliasing: Disabled
```

## Step 5: Build the Server

### 5.1 Create Build

```
File → Build Settings
Add Open Scenes (your main scene)
Click "Build"
Choose folder: "Builds/LinuxServer"
```

Result: `MyGameServer.x86_64` and `MyGameServer_Data/` folder

### 5.2 Test Build Locally

```bash
# Make executable
chmod +x MyGameServer.x86_64

# Run with environment variables
SERVER_ID=test-server-id SERVER_PORT=7777 ./MyGameServer.x86_64 -batchmode -nographics
```

**Expected output:**
```
Server started on port 7777
Heartbeat sent successfully
```

## Step 6: Docker Containerization

### 6.1 Create Dockerfile

Create `Builds/LinuxServer/Dockerfile`:

```dockerfile
FROM ubuntu:22.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    libglu1-mesa \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -u 1000 gameserver

WORKDIR /app

# Copy Unity build
COPY MyGameServer.x86_64 ./
COPY MyGameServer_Data ./MyGameServer_Data/

# Make executable
RUN chmod +x MyGameServer.x86_64 && \
    chown -R gameserver:gameserver /app

# Switch to non-root user
USER gameserver

# Expose port (will be overridden by environment variable)
EXPOSE 7777

# Run server
CMD ./MyGameServer.x86_64 -batchmode -nographics -logFile /dev/stdout
```

### 6.2 Build Docker Image

```bash
cd Builds/LinuxServer

# Build image
docker build -t my-game-server:1.0.0 .

# Test locally
docker run -it --rm \
  -e SERVER_ID=test-123 \
  -e SERVER_PORT=7777 \
  -p 7777:7777 \
  my-game-server:1.0.0
```

## Step 7: Upload to Platform

### 7.1 Package Build

```bash
cd Builds/LinuxServer

# Create archive
tar -czf my-game-server-v1.0.0.tar.gz \
  MyGameServer.x86_64 \
  MyGameServer_Data \
  Dockerfile
```

### 7.2 Upload via Web Panel

1. Login to web panel
2. Navigate to your project
3. Click "Upload Build"
4. Select `my-game-server-v1.0.0.tar.gz`
5. Enter version: `1.0.0`
6. Click "Upload"

### 7.3 Upload via API

```bash
# Get access token from login
TOKEN="your-jwt-token"
PROJECT_ID="your-project-id"

# Upload build
curl -X POST "http://localhost:3000/projects/${PROJECT_ID}/builds" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "build=@my-game-server-v1.0.0.tar.gz" \
  -F "version=1.0.0"
```

## Step 8: Deploy and Test

### 8.1 Deploy Server

Via web panel:
1. Navigate to project
2. Click "Deploy Server"
3. Select build version
4. Click "Deploy"
5. Note the IP and Port

Via API:
```bash
curl -X POST "http://localhost:3000/servers/projects/${PROJECT_ID}/deploy" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json"
```

### 8.2 Connect Client to Server

In your Unity client build:

```csharp
NetworkManager networkManager = NetworkManager.singleton;
networkManager.networkAddress = "server-ip-from-platform";

// Get the transport component
TelepathyTransport transport = networkManager.GetComponent<TelepathyTransport>();
transport.port = 7001; // Port from platform

networkManager.StartClient();
```

## Best Practices

### Performance

1. **Disable Graphics**: Always use `-batchmode -nographics`
2. **Reduce Quality**: Use lowest quality settings for server
3. **Optimize Physics**: Reduce physics update rate if not critical
4. **Object Pooling**: Reuse objects instead of instantiate/destroy

### Security

1. **Validate Input**: Always validate client inputs on server
2. **Rate Limiting**: Limit message frequency from clients
3. **Authority**: Server is authoritative, not client
4. **Encryption**: Use SSL/TLS for sensitive data

### Monitoring

1. **Logging**: Log important events to stdout
2. **Metrics**: Track player count, message rate, errors
3. **Heartbeat**: Send regular heartbeats to platform

### Resource Management

1. **Memory**: Monitor memory usage, prevent leaks
2. **CPU**: Profile and optimize hot paths
3. **Network**: Minimize network traffic, use delta compression

## Troubleshooting

### Server Won't Start

```bash
# Check logs
docker logs <container-id>

# Common issues:
# - Missing dependencies: Install via apt
# - Permission denied: Check file permissions
# - Port in use: Check with netstat -tuln
```

### Client Can't Connect

```bash
# Verify server is listening
netstat -tuln | grep 7777

# Check firewall
sudo ufw status

# Allow port
sudo ufw allow 7777/tcp
sudo ufw allow 7777/udp
```

### Heartbeat Failing

```bash
# Check SERVER_ID environment variable
echo $SERVER_ID

# Check backend URL
curl http://backend:3000/health

# Check logs for network errors
```

## Example Project Structure

```
MyGameServer/
├── Assets/
│   ├── Scenes/
│   │   └── GameScene.unity
│   ├── Scripts/
│   │   ├── GameServerManager.cs
│   │   ├── PlayerController.cs
│   │   └── GameLogic/
│   └── Prefabs/
│       └── Player.prefab
├── Builds/
│   └── LinuxServer/
│       ├── MyGameServer.x86_64
│       ├── MyGameServer_Data/
│       ├── Dockerfile
│       └── my-game-server-v1.0.0.tar.gz
└── ProjectSettings/
```

## Next Steps

- [Unity SDK Integration Guide](./unity-sdk-guide.md) - Connect clients to servers
- [API Reference](./api-reference.md) - Platform API documentation

## Resources

- Mirror Networking: https://mirror-networking.gitbook.io/
- Unity Headless Mode: https://docs.unity3d.com/Manual/CommandLineArguments.html
- Docker Best Practices: https://docs.docker.com/develop/dev-best-practices/
