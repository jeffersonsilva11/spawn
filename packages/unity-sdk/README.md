# Game Backend Unity SDK

Unity SDK for the Game Backend platform. Provides easy integration for player authentication, cloud saves, analytics, and leaderboards.

## Features

- ✅ **Player Management** - Register and authenticate players
- ✅ **Cloud Save** - Save and load player data across devices
- ✅ **Analytics** - Track custom events and player behavior
- ✅ **Leaderboards** - Global and custom leaderboards with rankings

## Installation

1. Copy `GameBackend.cs` to your Unity project's `Assets/Scripts` folder
2. Get your API credentials from the Game Backend web panel
3. Initialize the SDK in your game

## Quick Start

```csharp
using GameBackendSDK;

void Start()
{
    GameBackend.Instance.Initialize(
        "https://api.yourgame.com",
        "your-api-key"
    );
}
```

See `Example.cs` for complete usage examples.

## License

This SDK is provided as part of the Game Backend platform.
