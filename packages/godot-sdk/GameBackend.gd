##
## Game Backend Godot SDK
##
## Main SDK class for interacting with the Game Backend platform
## Provides player authentication, analytics, and leaderboard functionality
##
## @tutorial: https://docs.gamebackend.com/godot
##

extends Node

class_name GameBackend

# Singleton instance
static func get_instance() -> GameBackend:
	if not Engine.has_singleton("GameBackend"):
		var instance = GameBackend.new()
		instance.name = "GameBackend"
		Engine.get_main_loop().root.add_child(instance)
	return Engine.get_main_loop().root.get_node("GameBackend")

# Configuration
var api_url: String = ""
var api_key: String = ""
var access_token: String = ""

# HTTP client
var http_client: HTTPRequest

## Initialize the SDK with your project configuration
##
## @param url: Backend API URL (e.g., "https://api.yourgame.com")
## @param key: Your project API Key
func initialize(url: String, key: String) -> void:
	api_url = url.trim_suffix("/")
	api_key = key

	# Create HTTP client
	if not http_client:
		http_client = HTTPRequest.new()
		add_child(http_client)

	print("[GameBackend] Initialized with API URL: ", api_url)

## Set the access token for authenticated requests
func set_access_token(token: String) -> void:
	access_token = token

# ============================================
# PLAYER MANAGEMENT
# ============================================

## Register a new player
##
## @param project_id: Your project ID
## @param player_id: Unique player identifier
## @param password: Player password
## @param email: Player email (optional)
## @param display_name: Player display name (optional)
## @return: Dictionary with success status and response
func register_player(
	project_id: String,
	player_id: String,
	password: String,
	email: String = "",
	display_name: String = ""
) -> Dictionary:
	var data = {
		"projectId": project_id,
		"playerId": player_id,
		"password": password
	}

	if email != "":
		data["email"] = email

	if display_name != "":
		data["displayName"] = display_name

	var result = await _post_request("/players/register", data)

	if result.success:
		print("[GameBackend] Player registered successfully")

	return result

## Login a player and receive access token
##
## @param project_id: Your project ID
## @param player_id: Player identifier
## @param password: Player password
## @return: Dictionary with success, player_id, and access_token
func login_player(
	project_id: String,
	player_id: String,
	password: String
) -> Dictionary:
	var data = {
		"projectId": project_id,
		"playerId": player_id,
		"password": password
	}

	var result = await _post_request("/players/login", data)

	if result.success:
		var response = result.data
		if response.has("accessToken"):
			set_access_token(response.accessToken)
			print("[GameBackend] Player logged in successfully")
			return {
				"success": true,
				"player_id": response.player.id,
				"access_token": response.accessToken,
				"display_name": response.player.get("displayName", "")
			}

	return {"success": false}

## Save player data (cloud save)
##
## @param player_id: Player's database ID
## @param key: Data key
## @param value: Data value (will be converted to JSON)
## @return: Dictionary with success status
func save_player_data(
	player_id: String,
	key: String,
	value
) -> Dictionary:
	var data = {
		"key": key,
		"value": str(value)
	}

	var result = await _post_request("/players/" + player_id + "/data", data)

	if result.success:
		print("[GameBackend] Saved data for key: ", key)

	return result

## Load player data (cloud save)
##
## @param player_id: Player's database ID
## @param key: Data key
## @return: Dictionary with success status and value
func load_player_data(
	player_id: String,
	key: String
) -> Dictionary:
	var result = await _get_request("/players/" + player_id + "/data/" + key)

	if result.success and result.data.has("data"):
		return {
			"success": true,
			"value": result.data.data.value
		}

	return {"success": false, "value": null}

# ============================================
# ANALYTICS
# ============================================

## Track an analytics event
##
## @param project_id: Your project ID
## @param event_name: Name of the event (e.g., "level_completed")
## @param event_data: Dictionary with event data
## @param player_id: Player ID (optional, for anonymous events)
## @return: Dictionary with success status
func track_event(
	project_id: String,
	event_name: String,
	event_data: Dictionary,
	player_id: String = ""
) -> Dictionary:
	var data = {
		"projectId": project_id,
		"eventName": event_name,
		"eventData": event_data
	}

	if player_id != "":
		data["playerId"] = player_id

	var result = await _post_request("/analytics/track", data)

	if result.success:
		print("[GameBackend] Event tracked: ", event_name)

	return result

# ============================================
# LEADERBOARDS
# ============================================

## Submit a score to a leaderboard
##
## @param project_id: Your project ID
## @param leaderboard_name: Name of the leaderboard
## @param player_id: Player's database ID
## @param score: Player's score
## @param metadata: Additional metadata (optional)
## @return: Dictionary with success status and rank
func submit_score(
	project_id: String,
	leaderboard_name: String,
	player_id: String,
	score: float,
	metadata: Dictionary = {}
) -> Dictionary:
	var data = {
		"projectId": project_id,
		"leaderboardName": leaderboard_name,
		"playerId": player_id,
		"score": score
	}

	if not metadata.is_empty():
		data["metadata"] = metadata

	var result = await _post_request("/leaderboards/submit", data)

	if result.success:
		var rank = result.data.leaderboard.get("rank", 0)
		print("[GameBackend] Score submitted. Rank: ", rank)
		return {
			"success": true,
			"rank": rank,
			"score": score
		}

	return {"success": false, "rank": 0}

## Get leaderboard rankings
##
## @param project_id: Your project ID
## @param leaderboard_name: Name of the leaderboard
## @param limit: Maximum number of entries to return (default: 100)
## @return: Dictionary with success status and entries array
func get_leaderboard(
	project_id: String,
	leaderboard_name: String,
	limit: int = 100
) -> Dictionary:
	var url = "/leaderboards/projects/" + project_id + "/" + leaderboard_name + "?limit=" + str(limit)
	var result = await _get_request(url)

	if result.success and result.data.has("leaderboard"):
		return {
			"success": true,
			"entries": result.data.leaderboard.entries,
			"total": result.data.leaderboard.totalEntries
		}

	return {"success": false, "entries": []}

# ============================================
# HTTP HELPERS
# ============================================

## Internal POST request helper
func _post_request(endpoint: String, data: Dictionary) -> Dictionary:
	var url = api_url + endpoint
	var headers = [
		"Content-Type: application/json",
		"X-API-Key: " + api_key
	]

	if access_token != "":
		headers.append("Authorization: Bearer " + access_token)

	var json = JSON.stringify(data)

	http_client.request(url, headers, HTTPClient.METHOD_POST, json)
	var response = await http_client.request_completed

	return _handle_response(response)

## Internal GET request helper
func _get_request(endpoint: String) -> Dictionary:
	var url = api_url + endpoint
	var headers = [
		"X-API-Key: " + api_key
	]

	if access_token != "":
		headers.append("Authorization: Bearer " + access_token)

	http_client.request(url, headers, HTTPClient.METHOD_GET)
	var response = await http_client.request_completed

	return _handle_response(response)

## Handle HTTP response
func _handle_response(response: Array) -> Dictionary:
	var result = response[0]
	var response_code = response[1]
	var headers = response[2]
	var body = response[3]

	if result != HTTPRequest.RESULT_SUCCESS:
		push_error("[GameBackend] Request failed: ", result)
		return {"success": false, "error": "Request failed"}

	if response_code >= 200 and response_code < 300:
		var json = JSON.new()
		var parse_result = json.parse(body.get_string_from_utf8())

		if parse_result == OK:
			return {"success": true, "data": json.data}
		else:
			push_error("[GameBackend] JSON parse error")
			return {"success": false, "error": "JSON parse error"}
	else:
		push_error("[GameBackend] HTTP error: ", response_code)
		return {"success": false, "error": "HTTP error " + str(response_code)}
