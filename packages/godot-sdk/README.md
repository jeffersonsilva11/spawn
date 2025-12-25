# Game Backend Godot SDK

Godot Engine SDK for the Game Backend platform. Provides easy integration for player authentication, cloud saves, analytics, and leaderboards.

## Features

- ✅ **Player Management** - Register and authenticate players
- ✅ **Cloud Save** - Save and load player data across devices
- ✅ **Analytics** - Track custom events and player behavior
- ✅ **Leaderboards** - Global and custom leaderboards with rankings
- ✅ **Async/Await** - Modern GDScript 2.0 async patterns

## Installation

1. Copy `GameBackend.gd` to your Godot project's `res://` folder
2. The script will automatically create a singleton
3. Get your API credentials from the Game Backend web panel
4. Initialize the SDK in your game

## Quick Start

### 1. Initialize the SDK

```gdscript
extends Node

var backend: GameBackend

func _ready():
    backend = GameBackend.get_instance()
    backend.initialize(
        "https://api.yourgame.com",  # Your backend API URL
        "your-api-key"                # Your project API key
    )
```

### 2. Register a Player

```gdscript
var player_id = OS.get_unique_id()

var result = await backend.register_player(
    "project-id",
    player_id,
    "password123",
    "",           # email (optional)
    "PlayerName"  # displayName (optional)
)

if result.success:
    print("Player registered!")
```

### 3. Login a Player

```gdscript
var result = await backend.login_player(
    "project-id",
    player_id,
    "password123"
)

if result.success:
    var player_id = result.player_id
    var token = result.access_token
    # Token is automatically set for future requests
```

### 4. Save Player Data (Cloud Save)

```gdscript
var result = await backend.save_player_data(
    player_id,
    "player_level",
    "10"
)

if result.success:
    print("Progress saved!")
```

### 5. Load Player Data

```gdscript
var result = await backend.load_player_data(
    player_id,
    "player_level"
)

if result.success:
    var level = int(result.value)
    # Use the loaded data
```

### 6. Track Analytics Events

```gdscript
var event_data = {
    "level": 5,
    "time": 120.5,
    "stars": 3
}

var result = await backend.track_event(
    "project-id",
    "level_completed",
    event_data,
    player_id
)

if result.success:
    print("Event tracked!")
```

### 7. Submit Score to Leaderboard

```gdscript
var metadata = {
    "playerName": "Player1"
}

var result = await backend.submit_score(
    "project-id",
    "global_highscore",  # leaderboard name
    player_id,
    9999.0,              # score
    metadata
)

if result.success:
    print("Your rank: ", result.rank)
```

### 8. Get Leaderboard Rankings

```gdscript
var result = await backend.get_leaderboard(
    "project-id",
    "global_highscore",
    10  # limit (top 10)
)

if result.success:
    for entry in result.entries:
        print("%d. %s: %.0f" % [entry.rank, entry.playerDisplayName, entry.score])
```

## Complete Example

See `Example.gd` for a complete game integration example showing:
- Player registration and login flow
- Cloud save for game progress
- Analytics tracking for level completion and purchases
- Leaderboard submission and retrieval
- Signal-based UI updates

## API Methods

### Player Management

- `register_player(project_id, player_id, password, email, display_name) -> Dictionary`
- `login_player(project_id, player_id, password) -> Dictionary`
- `set_access_token(token) -> void`

### Cloud Save

- `save_player_data(player_id, key, value) -> Dictionary`
- `load_player_data(player_id, key) -> Dictionary`

### Analytics

- `track_event(project_id, event_name, event_data, player_id) -> Dictionary`

### Leaderboards

- `submit_score(project_id, leaderboard_name, player_id, score, metadata) -> Dictionary`
- `get_leaderboard(project_id, leaderboard_name, limit) -> Dictionary`

## Best Practices

### 1. Use Device ID for Player ID

```gdscript
var player_id = OS.get_unique_id()
```

### 2. Save Token for Persistent Login

```gdscript
# After login, save token
var config = ConfigFile.new()
config.set_value("auth", "token", access_token)
config.save("user://auth.cfg")

# On app start, restore token
config.load("user://auth.cfg")
if config.has_section_key("auth", "token"):
    backend.set_access_token(config.get_value("auth", "token"))
```

### 3. Use Signals for UI Updates

```gdscript
signal player_logged_in(player_id)
signal score_submitted(rank)

func login_player_async(player_id: String, password: String):
    var result = await backend.login_player(PROJECT_ID, player_id, password)
    if result.success:
        player_logged_in.emit(result.player_id)
```

### 4. Track Meaningful Events

Track events that help you understand player behavior:
- Game sessions (start, end)
- Level progression
- In-game purchases
- Tutorial completion
- Player retention metrics

## Error Handling

All methods return a Dictionary with a `success` key:

```gdscript
var result = await backend.save_player_data(player_id, "level", "10")

if result.success:
    # Handle success
    print("Data saved!")
else:
    # Handle error
    if result.has("error"):
        print("Error: ", result.error)
```

## Requirements

- Godot 4.0 or later (uses GDScript 2.0 features)
- Game Backend platform account
- Project created in the web panel

## Godot-Specific Features

### Autoload Singleton

The SDK automatically creates a singleton instance, so you can access it from anywhere:

```gdscript
# From any script
var backend = GameBackend.get_instance()
```

### Async/Await Pattern

Uses Godot 4.0's modern async pattern:

```gdscript
func save_and_continue():
    var result = await backend.save_player_data(player_id, "checkpoint", "5")
    if result.success:
        get_tree().change_scene_to_file("res://next_level.tscn")
```

## Support

For issues and questions:
- Web Panel: View your analytics, players, and leaderboards
- API Documentation: See backend API docs for detailed endpoint information

## License

This SDK is provided as part of the Game Backend platform.
