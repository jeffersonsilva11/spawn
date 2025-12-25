# Unity SDK Integration Guide

This guide explains how to integrate the Game Backend Platform SDK into your Unity client project.

## Overview

The Unity SDK provides a simple API to:
- Authenticate with the platform
- Get available server instances
- Connect clients to servers
- No AWS or backend knowledge required

## Installation

### Method 1: Unity Package Manager (Recommended)

1. Open Unity project
2. Window → Package Manager
3. Click "+" → Add package from git URL
4. Enter: `https://github.com/your-org/unity-sdk.git`

### Method 2: Manual Installation

1. Download SDK from releases
2. Extract to `Assets/GameBackendSDK/`
3. Unity will auto-import

## Quick Start

### Step 1: Initialize SDK

Create a GameManager script in your Unity project:

```csharp
using UnityEngine;
using GameBackendSDK;

public class GameManager : MonoBehaviour
{
    [Header("Backend Configuration")]
    public string apiUrl = "http://localhost:3000";
    public string apiKey = "your-studio-api-key";
    public string projectId = "your-project-id";

    private GameBackendClient client;

    async void Start()
    {
        // Initialize SDK
        client = new GameBackendClient(apiUrl, apiKey);

        Debug.Log("SDK Initialized");
    }
}
```

### Step 2: Get Server and Connect

```csharp
using UnityEngine;
using GameBackendSDK;
using Mirror;

public class GameManager : MonoBehaviour
{
    private GameBackendClient client;
    private NetworkManager networkManager;

    async void Start()
    {
        // Initialize
        client = new GameBackendClient(apiUrl, apiKey);
        networkManager = NetworkManager.singleton;

        try
        {
            // Get available server
            var serverInfo = await client.GetServer(projectId);

            Debug.Log($"Server found: {serverInfo.Ip}:{serverInfo.Port}");

            // Connect to server
            ConnectToServer(serverInfo);
        }
        catch (System.Exception e)
        {
            Debug.LogError($"Failed to get server: {e.Message}");
        }
    }

    void ConnectToServer(ServerInfo serverInfo)
    {
        // Set network manager settings
        networkManager.networkAddress = serverInfo.Ip;

        // Set transport port (Mirror/Telepathy example)
        var transport = networkManager.GetComponent<TelepathyTransport>();
        if (transport != null)
        {
            transport.port = (ushort)serverInfo.Port;
        }

        // Connect
        networkManager.StartClient();

        Debug.Log($"Connecting to {serverInfo.Ip}:{serverInfo.Port}");
    }
}
```

## SDK API Reference

### GameBackendClient

Main SDK class for interacting with the platform.

#### Constructor

```csharp
public GameBackendClient(string apiUrl, string apiKey)
```

**Parameters:**
- `apiUrl`: Backend API URL (e.g., `http://api.yourgame.com` or `http://localhost:3000`)
- `apiKey`: Studio API key (get from web panel after registration)

**Example:**
```csharp
var client = new GameBackendClient(
    "https://api.mygame.com",
    "gbk_a1b2c3d4e5f6..."
);
```

#### Methods

##### GetServer

Get an available server instance for a project.

```csharp
public async Task<ServerInfo> GetServer(string projectId)
```

**Parameters:**
- `projectId`: Your project ID (UUID)

**Returns:**
- `ServerInfo`: Server connection information

**Throws:**
- `GameBackendException`: If no server available or request fails

**Example:**
```csharp
try
{
    ServerInfo server = await client.GetServer("project-uuid-here");
    Debug.Log($"Server: {server.Ip}:{server.Port}");
}
catch (GameBackendException e)
{
    Debug.LogError($"Error: {e.Message}");
}
```

### ServerInfo

Contains server connection information.

**Properties:**
```csharp
public class ServerInfo
{
    public string Id { get; set; }         // Server instance ID
    public string Ip { get; set; }         // Server IP address
    public int Port { get; set; }          // Server port
    public string Status { get; set; }     // Server status
}
```

**Example:**
```csharp
ServerInfo server = await client.GetServer(projectId);

// Access properties
string serverIp = server.Ip;
int serverPort = server.Port;
string status = server.Status;
```

### GameBackendException

Custom exception for SDK errors.

**Properties:**
```csharp
public class GameBackendException : Exception
{
    public string ErrorCode { get; set; }
    public int StatusCode { get; set; }
}
```

**Example:**
```csharp
try
{
    await client.GetServer(projectId);
}
catch (GameBackendException e)
{
    Debug.LogError($"SDK Error: {e.Message}");
    Debug.LogError($"Status: {e.StatusCode}");
    Debug.LogError($"Code: {e.ErrorCode}");
}
```

## Complete Example

### Multiplayer Game Client

```csharp
using UnityEngine;
using UnityEngine.UI;
using GameBackendSDK;
using Mirror;
using System.Threading.Tasks;

public class MultiplayerGameManager : MonoBehaviour
{
    [Header("Backend Configuration")]
    public string apiUrl = "https://api.mygame.com";
    public string apiKey = "gbk_your_api_key_here";
    public string projectId = "your-project-uuid";

    [Header("UI References")]
    public Button connectButton;
    public Text statusText;

    private GameBackendClient backendClient;
    private NetworkManager networkManager;

    void Start()
    {
        // Initialize SDK
        backendClient = new GameBackendClient(apiUrl, apiKey);
        networkManager = NetworkManager.singleton;

        // Setup UI
        connectButton.onClick.AddListener(OnConnectClicked);
        UpdateStatus("Ready to connect");
    }

    async void OnConnectClicked()
    {
        connectButton.interactable = false;
        UpdateStatus("Finding server...");

        try
        {
            // Get server
            ServerInfo server = await backendClient.GetServer(projectId);

            UpdateStatus($"Server found: {server.Ip}:{server.Port}");

            // Connect
            await Task.Delay(1000); // Brief delay to show message
            ConnectToGameServer(server);
        }
        catch (GameBackendException e)
        {
            UpdateStatus($"Error: {e.Message}");
            connectButton.interactable = true;

            if (e.Message.Contains("No available server"))
            {
                UpdateStatus("No servers available. Please deploy one from the web panel.");
            }
        }
        catch (System.Exception e)
        {
            UpdateStatus($"Connection failed: {e.Message}");
            connectButton.interactable = true;
        }
    }

    void ConnectToGameServer(ServerInfo server)
    {
        // Configure NetworkManager
        networkManager.networkAddress = server.Ip;

        // Configure transport (example with Telepathy)
        var transport = networkManager.GetComponent<TelepathyTransport>();
        if (transport != null)
        {
            transport.port = (ushort)server.Port;
        }

        // Start client
        networkManager.StartClient();

        // Update UI
        UpdateStatus($"Connecting to {server.Ip}:{server.Port}...");

        // Hook into Mirror events
        NetworkClient.OnConnectedEvent += OnClientConnected;
        NetworkClient.OnDisconnectedEvent += OnClientDisconnected;
    }

    void OnClientConnected()
    {
        UpdateStatus("Connected to server!");
        connectButton.interactable = false;
    }

    void OnClientDisconnected()
    {
        UpdateStatus("Disconnected from server");
        connectButton.interactable = true;

        // Clean up events
        NetworkClient.OnConnectedEvent -= OnClientConnected;
        NetworkClient.OnDisconnectedEvent -= OnClientDisconnected;
    }

    void UpdateStatus(string message)
    {
        statusText.text = message;
        Debug.Log(message);
    }

    void OnDestroy()
    {
        // Clean up
        if (connectButton != null)
        {
            connectButton.onClick.RemoveListener(OnConnectClicked);
        }
    }
}
```

### Main Menu Scene

Create a simple UI:

1. Canvas
   - Text: "Game Backend Platform"
   - Text: "Status: Ready"
   - Button: "Connect to Server"

2. Attach `MultiplayerGameManager` to GameObject
3. Assign UI references in inspector
4. Enter your API key and project ID

## SDK Implementation

### GameBackendClient.cs

Create `Assets/GameBackendSDK/Runtime/GameBackendClient.cs`:

```csharp
using System;
using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.Networking;

namespace GameBackendSDK
{
    public class GameBackendClient
    {
        private readonly string apiUrl;
        private readonly string apiKey;

        public GameBackendClient(string apiUrl, string apiKey)
        {
            this.apiUrl = apiUrl?.TrimEnd('/') ?? throw new ArgumentNullException(nameof(apiUrl));
            this.apiKey = apiKey ?? throw new ArgumentNullException(nameof(apiKey));
        }

        public async Task<ServerInfo> GetServer(string projectId)
        {
            if (string.IsNullOrEmpty(projectId))
            {
                throw new ArgumentNullException(nameof(projectId));
            }

            string url = $"{apiUrl}/sdk/projects/{projectId}/server";

            using (UnityWebRequest request = UnityWebRequest.Get(url))
            {
                // Set headers
                request.SetRequestHeader("X-API-Key", apiKey);
                request.SetRequestHeader("Content-Type", "application/json");

                // Send request
                var operation = request.SendWebRequest();

                // Wait for completion
                while (!operation.isDone)
                {
                    await Task.Yield();
                }

                // Handle response
                if (request.result == UnityWebRequest.Result.Success)
                {
                    string json = request.downloadHandler.text;
                    var response = JsonUtility.FromJson<GetServerResponse>(json);

                    return response.server;
                }
                else
                {
                    string errorMessage = request.error;

                    if (request.downloadHandler != null)
                    {
                        errorMessage = request.downloadHandler.text;
                    }

                    throw new GameBackendException(
                        $"Failed to get server: {errorMessage}",
                        (int)request.responseCode
                    );
                }
            }
        }
    }

    [Serializable]
    public class ServerInfo
    {
        public string id;
        public string ip;
        public int port;
        public string status;

        public string Id => id;
        public string Ip => ip;
        public int Port => port;
        public string Status => status;
    }

    [Serializable]
    internal class GetServerResponse
    {
        public ServerInfo server;
    }

    public class GameBackendException : Exception
    {
        public int StatusCode { get; set; }
        public string ErrorCode { get; set; }

        public GameBackendException(string message, int statusCode = 0)
            : base(message)
        {
            StatusCode = statusCode;
        }
    }
}
```

### Package Structure

Create `Assets/GameBackendSDK/package.json`:

```json
{
  "name": "com.yourstudio.gamebackend-sdk",
  "version": "1.0.0",
  "displayName": "Game Backend SDK",
  "description": "Unity SDK for Game Backend Platform",
  "unity": "2022.3",
  "keywords": [
    "multiplayer",
    "backend",
    "networking"
  ],
  "author": {
    "name": "Your Studio",
    "url": "https://yourstudio.com"
  }
}
```

### Assembly Definition

Create `Assets/GameBackendSDK/Runtime/GameBackendSDK.asmdef`:

```json
{
    "name": "GameBackendSDK",
    "rootNamespace": "GameBackendSDK",
    "references": [],
    "includePlatforms": [],
    "excludePlatforms": [],
    "allowUnsafeCode": false,
    "overrideReferences": false,
    "precompiledReferences": [],
    "autoReferenced": true,
    "defineConstraints": [],
    "versionDefines": [],
    "noEngineReferences": false
}
```

## Platform Configuration

### Get API Key

1. Register studio: http://localhost:3002/register
2. Login to web panel
3. Navigate to Studio Settings
4. Copy API Key (starts with `gbk_`)

### Get Project ID

1. Create project in web panel
2. Note the project ID (UUID format)
3. Use in SDK initialization

## Best Practices

### Security

```csharp
// ❌ DON'T hardcode API keys in public builds
public string apiKey = "gbk_a1b2c3d4...";

// ✅ DO load from configuration file
string apiKey = ConfigManager.GetApiKey();

// ✅ OR use environment-specific configs
#if UNITY_EDITOR
    string apiKey = EditorApiKey;
#else
    string apiKey = ProductionApiKey;
#endif
```

### Error Handling

```csharp
// Always handle exceptions
try
{
    var server = await client.GetServer(projectId);
    ConnectToServer(server);
}
catch (GameBackendException e)
{
    // Handle specific SDK errors
    if (e.StatusCode == 404)
    {
        ShowMessage("No servers available");
    }
    else
    {
        ShowMessage($"Error: {e.Message}");
    }
}
catch (Exception e)
{
    // Handle general errors
    ShowMessage("Connection failed");
    Debug.LogError(e);
}
```

### Retry Logic

```csharp
async Task<ServerInfo> GetServerWithRetry(int maxRetries = 3)
{
    for (int i = 0; i < maxRetries; i++)
    {
        try
        {
            return await client.GetServer(projectId);
        }
        catch (GameBackendException e)
        {
            if (i == maxRetries - 1) throw;

            Debug.LogWarning($"Retry {i + 1}/{maxRetries}");
            await Task.Delay(2000); // Wait 2 seconds
        }
    }

    throw new Exception("Max retries exceeded");
}
```

## Troubleshooting

### "No available server" Error

**Solution:** Deploy a server first via web panel or API.

### "Invalid API key" Error

**Solution:** Check API key is correct and not expired.

### Connection Timeout

**Solution:** Check server IP and firewall rules.

### SDK Not Found

**Solution:** Ensure SDK is in correct folder and assembly definition exists.

## Next Steps

- [Unity Server Build Guide](./unity-server-guide.md)
- [API Reference](./api-reference.md)
- [Web Panel Guide](./web-panel-guide.md)

## Support

- GitHub Issues: <repository-url>/issues
- Documentation: <repository-url>/docs
- Discord: <your-discord>
