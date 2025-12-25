# Game Backend SDK for Unity

Unity client SDK for the Indie Game Backend Platform.

## Installation

### Unity Package Manager

1. Open Unity project
2. Window → Package Manager
3. Click "+" → Add package from git URL
4. Enter: `https://github.com/your-org/spawn.git?path=/packages/unity-sdk`

### Manual

1. Copy `Runtime` folder to `Assets/GameBackendSDK/Runtime/`
2. Unity will auto-import

## Quick Start

```csharp
using UnityEngine;
using GameBackendSDK;
using Mirror;

public class GameManager : MonoBehaviour
{
    private GameBackendClient client;

    async void Start()
    {
        // Initialize SDK
        client = new GameBackendClient(
            "http://localhost:3000",  // API URL
            "gbk_your_api_key_here"    // Studio API key
        );

        try
        {
            // Get available server
            ServerInfo server = await client.GetServer("your-project-id");

            Debug.Log($"Server: {server.Ip}:{server.Port}");

            // Connect to server
            NetworkManager.singleton.networkAddress = server.Ip;
            NetworkManager.singleton.GetComponent<TelepathyTransport>().port = (ushort)server.Port;
            NetworkManager.singleton.StartClient();
        }
        catch (GameBackendException e)
        {
            Debug.LogError($"Error: {e.Message}");
        }
    }
}
```

## Documentation

See [Unity SDK Integration Guide](../../../docs/unity-sdk-guide.md) for complete documentation.

## API Reference

### GameBackendClient

```csharp
// Initialize
var client = new GameBackendClient(apiUrl, apiKey);

// Get server
ServerInfo server = await client.GetServer(projectId);
```

### ServerInfo

```csharp
public class ServerInfo
{
    public string Id { get; }
    public string Ip { get; }
    public int Port { get; }
    public string Status { get; }
}
```

## Requirements

- Unity 2022.3+
- .NET Standard 2.1
- Mirror or Unity Netcode (for multiplayer)

## License

MIT
