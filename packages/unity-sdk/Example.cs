/**
 * Game Backend Unity SDK - Usage Example
 *
 * This example demonstrates how to use the Game Backend SDK in your Unity game
 */

using UnityEngine;
using GameBackendSDK;

public class GameBackendExample : MonoBehaviour
{
    private string projectId = "your-project-id";
    private string apiKey = "your-api-key";
    private string currentPlayerId;

    void Start()
    {
        // Initialize the SDK
        GameBackend.Instance.Initialize("http://localhost:3000", apiKey);

        // Example: Register and login a player
        StartCoroutine(RegisterAndLogin());
    }

    // ============================================
    // PLAYER MANAGEMENT EXAMPLES
    // ============================================

    IEnumerator RegisterAndLogin()
    {
        string playerId = SystemInfo.deviceUniqueIdentifier;
        string password = "player123";

        // Register new player
        yield return GameBackend.Instance.RegisterPlayer(
            projectId,
            playerId,
            password,
            null, // email (optional)
            "PlayerName", // displayName (optional)
            (success, response) =>
            {
                if (success)
                {
                    Debug.Log("Player registered successfully!");
                    StartCoroutine(Login(playerId, password));
                }
                else
                {
                    Debug.LogError($"Registration failed: {response}");
                }
            }
        );
    }

    IEnumerator Login(string playerId, string password)
    {
        yield return GameBackend.Instance.LoginPlayer(
            projectId,
            playerId,
            password,
            (success, dbPlayerId, accessToken) =>
            {
                if (success)
                {
                    currentPlayerId = dbPlayerId;
                    Debug.Log($"Logged in! Token: {accessToken}");

                    // Now you can save/load data, track events, etc.
                    StartCoroutine(SaveGameProgress());
                }
            }
        );
    }

    // ============================================
    // CLOUD SAVE EXAMPLES
    // ============================================

    IEnumerator SaveGameProgress()
    {
        // Save player level
        yield return GameBackend.Instance.SavePlayerData(
            currentPlayerId,
            "player_level",
            "10",
            (success) =>
            {
                if (success)
                {
                    Debug.Log("Progress saved!");
                    StartCoroutine(LoadGameProgress());
                }
            }
        );
    }

    IEnumerator LoadGameProgress()
    {
        yield return GameBackend.Instance.LoadPlayerData(
            currentPlayerId,
            "player_level",
            (success, value) =>
            {
                if (success)
                {
                    int level = int.Parse(value);
                    Debug.Log($"Loaded player level: {level}");
                }
            }
        );
    }

    // ============================================
    // ANALYTICS EXAMPLES
    // ============================================

    public void TrackLevelCompleted(int levelNumber, float completionTime)
    {
        var eventData = new System.Collections.Generic.Dictionary<string, object>
        {
            { "level", levelNumber },
            { "time", completionTime },
            { "stars", 3 }
        };

        StartCoroutine(
            GameBackend.Instance.TrackEvent(
                projectId,
                "level_completed",
                eventData,
                currentPlayerId,
                (success) =>
                {
                    if (success)
                    {
                        Debug.Log("Event tracked!");
                    }
                }
            )
        );
    }

    public void TrackPurchase(string itemId, int cost)
    {
        var eventData = new System.Collections.Generic.Dictionary<string, object>
        {
            { "item_id", itemId },
            { "cost", cost },
            { "currency", "gold" }
        };

        StartCoroutine(
            GameBackend.Instance.TrackEvent(
                projectId,
                "item_purchased",
                eventData,
                currentPlayerId,
                (success) =>
                {
                    if (success)
                    {
                        Debug.Log($"Purchase tracked: {itemId}");
                    }
                }
            )
        );
    }

    // ============================================
    // LEADERBOARD EXAMPLES
    // ============================================

    public void SubmitHighScore(float score)
    {
        var metadata = new System.Collections.Generic.Dictionary<string, object>
        {
            { "playerName", "Player1" },
            { "timestamp", System.DateTime.UtcNow.ToString() }
        };

        StartCoroutine(
            GameBackend.Instance.SubmitScore(
                projectId,
                "global_highscore",
                currentPlayerId,
                score,
                metadata,
                (success, rank) =>
                {
                    if (success)
                    {
                        Debug.Log($"Score submitted! Your rank: {rank}");
                        ShowRank(rank);
                    }
                }
            )
        );
    }

    public void LoadLeaderboard()
    {
        StartCoroutine(
            GameBackend.Instance.GetLeaderboard(
                projectId,
                "global_highscore",
                10, // Top 10
                (success, entries) =>
                {
                    if (success)
                    {
                        Debug.Log("Leaderboard loaded!");
                        foreach (var entry in entries)
                        {
                            Debug.Log($"{entry.rank}. {entry.playerDisplayName}: {entry.score}");
                        }
                    }
                }
            )
        );
    }

    void ShowRank(int rank)
    {
        // Update UI to show player's rank
        Debug.Log($"You are rank #{rank}!");
    }

    // ============================================
    // COMPLETE GAME FLOW EXAMPLE
    // ============================================

    void OnPlayerLogin()
    {
        // Called when player starts the game
        string deviceId = SystemInfo.deviceUniqueIdentifier;
        StartCoroutine(Login(deviceId, "password123"));
    }

    void OnLevelComplete(int level, float time)
    {
        // Save progress
        StartCoroutine(GameBackend.Instance.SavePlayerData(
            currentPlayerId,
            $"level_{level}_completed",
            "true",
            null
        ));

        // Track analytics
        TrackLevelCompleted(level, time);

        // Submit time to leaderboard
        StartCoroutine(GameBackend.Instance.SubmitScore(
            projectId,
            $"level_{level}_time",
            currentPlayerId,
            time,
            null,
            null
        ));
    }

    void OnGameStart()
    {
        // Track session start
        var eventData = new System.Collections.Generic.Dictionary<string, object>
        {
            { "device", SystemInfo.deviceModel },
            { "platform", Application.platform.ToString() }
        };

        StartCoroutine(GameBackend.Instance.TrackEvent(
            projectId,
            "game_started",
            eventData,
            currentPlayerId,
            null
        ));
    }
}
