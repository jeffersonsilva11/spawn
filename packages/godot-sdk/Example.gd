##
## Game Backend Godot SDK - Usage Example
##
## This example demonstrates how to use the Game Backend SDK in your Godot game
##

extends Node

# Configuration
const PROJECT_ID = "your-project-id"
const API_KEY = "your-api-key"

# Backend instance
var backend: GameBackend
var current_player_id: String = ""

func _ready() -> void:
	# Get singleton instance
	backend = GameBackend.get_instance()

	# Initialize the SDK
	backend.initialize("http://localhost:3000", API_KEY)

	# Example: Register and login a player
	await register_and_login()

# ============================================
# PLAYER MANAGEMENT EXAMPLES
# ============================================

func register_and_login() -> void:
	var player_id = OS.get_unique_id()  # Device unique ID
	var password = "player123"

	# Register new player
	var register_result = await backend.register_player(
		PROJECT_ID,
		player_id,
		password,
		"",  # email (optional)
		"PlayerName"  # displayName (optional)
	)

	if register_result.success:
		print("Player registered successfully!")
		await login(player_id, password)
	else:
		print("Registration failed, trying to login...")
		await login(player_id, password)

func login(player_id: String, password: String) -> void:
	var result = await backend.login_player(
		PROJECT_ID,
		player_id,
		password
	)

	if result.success:
		current_player_id = result.player_id
		print("Logged in! Token: ", result.access_token)

		# Now you can save/load data, track events, etc.
		await save_game_progress()

# ============================================
# CLOUD SAVE EXAMPLES
# ============================================

func save_game_progress() -> void:
	# Save player level
	var result = await backend.save_player_data(
		current_player_id,
		"player_level",
		"10"
	)

	if result.success:
		print("Progress saved!")
		await load_game_progress()

func load_game_progress() -> void:
	var result = await backend.load_player_data(
		current_player_id,
		"player_level"
	)

	if result.success:
		var level = int(result.value)
		print("Loaded player level: ", level)

# ============================================
# ANALYTICS EXAMPLES
# ============================================

func track_level_completed(level_number: int, completion_time: float) -> void:
	var event_data = {
		"level": level_number,
		"time": completion_time,
		"stars": 3
	}

	var result = await backend.track_event(
		PROJECT_ID,
		"level_completed",
		event_data,
		current_player_id
	)

	if result.success:
		print("Event tracked!")

func track_purchase(item_id: String, cost: int) -> void:
	var event_data = {
		"item_id": item_id,
		"cost": cost,
		"currency": "gold"
	}

	var result = await backend.track_event(
		PROJECT_ID,
		"item_purchased",
		event_data,
		current_player_id
	)

	if result.success:
		print("Purchase tracked: ", item_id)

# ============================================
# LEADERBOARD EXAMPLES
# ============================================

func submit_high_score(score: float) -> void:
	var metadata = {
		"playerName": "Player1",
		"timestamp": Time.get_datetime_string_from_system()
	}

	var result = await backend.submit_score(
		PROJECT_ID,
		"global_highscore",
		current_player_id,
		score,
		metadata
	)

	if result.success:
		print("Score submitted! Your rank: ", result.rank)
		show_rank(result.rank)

func load_leaderboard() -> void:
	var result = await backend.get_leaderboard(
		PROJECT_ID,
		"global_highscore",
		10  # Top 10
	)

	if result.success:
		print("Leaderboard loaded!")
		for entry in result.entries:
			print("%d. %s: %.0f" % [entry.rank, entry.playerDisplayName, entry.score])

func show_rank(rank: int) -> void:
	# Update UI to show player's rank
	print("You are rank #", rank, "!")

# ============================================
# COMPLETE GAME FLOW EXAMPLE
# ============================================

func on_player_login() -> void:
	# Called when player starts the game
	var device_id = OS.get_unique_id()
	await login(device_id, "password123")

func on_level_complete(level: int, time: float) -> void:
	# Save progress
	await backend.save_player_data(
		current_player_id,
		"level_" + str(level) + "_completed",
		"true"
	)

	# Track analytics
	await track_level_completed(level, time)

	# Submit time to leaderboard
	await backend.submit_score(
		PROJECT_ID,
		"level_" + str(level) + "_time",
		current_player_id,
		time
	)

func on_game_start() -> void:
	# Track session start
	var event_data = {
		"device": OS.get_name(),
		"platform": OS.get_model_name()
	}

	await backend.track_event(
		PROJECT_ID,
		"game_started",
		event_data,
		current_player_id
	)

# ============================================
# SIGNAL EXAMPLES
# ============================================

# You can emit signals for UI updates
signal player_logged_in(player_id: String)
signal score_submitted(rank: int)
signal data_loaded(key: String, value)

func login_with_signals(player_id: String, password: String) -> void:
	var result = await backend.login_player(PROJECT_ID, player_id, password)

	if result.success:
		current_player_id = result.player_id
		player_logged_in.emit(result.player_id)

func submit_score_with_signal(score: float) -> void:
	var result = await backend.submit_score(
		PROJECT_ID,
		"global_highscore",
		current_player_id,
		score
	)

	if result.success:
		score_submitted.emit(result.rank)
