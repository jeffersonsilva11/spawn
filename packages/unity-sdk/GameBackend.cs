/**
 * Game Backend Unity SDK
 *
 * Main SDK class for interacting with the Game Backend platform
 * Provides player authentication, analytics, and leaderboard functionality
 */

using System;
using System.Text;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;

namespace GameBackendSDK
{
    public class GameBackend
    {
        private static GameBackend instance;
        private string apiUrl;
        private string apiKey;
        private string accessToken;

        public static GameBackend Instance
        {
            get
            {
                if (instance == null)
                {
                    instance = new GameBackend();
                }
                return instance;
            }
        }

        /// <summary>
        /// Initialize the SDK with your project configuration
        /// </summary>
        /// <param name="apiUrl">Backend API URL (e.g., "https://api.yourgame.com")</param>
        /// <param name="apiKey">Your project API Key</param>
        public void Initialize(string apiUrl, string apiKey)
        {
            this.apiUrl = apiUrl.TrimEnd('/');
            this.apiKey = apiKey;
            Debug.Log($"[GameBackend] Initialized with API URL: {this.apiUrl}");
        }

        /// <summary>
        /// Set the access token for authenticated requests
        /// </summary>
        public void SetAccessToken(string token)
        {
            this.accessToken = token;
        }

        // ============================================
        // PLAYER MANAGEMENT
        // ============================================

        /// <summary>
        /// Register a new player
        /// </summary>
        public IEnumerator RegisterPlayer(string projectId, string playerId, string password,
            string email = null, string displayName = null, Action<bool, string> callback = null)
        {
            var data = new Dictionary<string, object>
            {
                { "projectId", projectId },
                { "playerId", playerId },
                { "password", password }
            };

            if (!string.IsNullOrEmpty(email))
                data["email"] = email;

            if (!string.IsNullOrEmpty(displayName))
                data["displayName"] = displayName;

            yield return PostRequest("/players/register", data, (success, response) =>
            {
                if (success)
                {
                    Debug.Log("[GameBackend] Player registered successfully");
                }
                callback?.Invoke(success, response);
            });
        }

        /// <summary>
        /// Login a player and receive access token
        /// </summary>
        public IEnumerator LoginPlayer(string projectId, string playerId, string password,
            Action<bool, string, string> callback = null)
        {
            var data = new Dictionary<string, object>
            {
                { "projectId", projectId },
                { "playerId", playerId },
                { "password", password }
            };

            yield return PostRequest("/players/login", data, (success, response) =>
            {
                if (success)
                {
                    var jsonResponse = JsonUtility.FromJson<LoginResponse>(response);
                    SetAccessToken(jsonResponse.accessToken);
                    Debug.Log("[GameBackend] Player logged in successfully");
                    callback?.Invoke(true, jsonResponse.player.id, jsonResponse.accessToken);
                }
                else
                {
                    callback?.Invoke(false, null, null);
                }
            });
        }

        /// <summary>
        /// Save player data (cloud save)
        /// </summary>
        public IEnumerator SavePlayerData(string playerId, string key, string value,
            Action<bool> callback = null)
        {
            var data = new Dictionary<string, object>
            {
                { "key", key },
                { "value", value }
            };

            yield return PostRequest($"/players/{playerId}/data", data, (success, response) =>
            {
                if (success)
                {
                    Debug.Log($"[GameBackend] Saved data for key: {key}");
                }
                callback?.Invoke(success);
            });
        }

        /// <summary>
        /// Load player data (cloud save)
        /// </summary>
        public IEnumerator LoadPlayerData(string playerId, string key,
            Action<bool, string> callback = null)
        {
            yield return GetRequest($"/players/{playerId}/data/{key}", (success, response) =>
            {
                if (success)
                {
                    var jsonResponse = JsonUtility.FromJson<PlayerDataResponse>(response);
                    callback?.Invoke(true, jsonResponse.data.value);
                }
                else
                {
                    callback?.Invoke(false, null);
                }
            });
        }

        // ============================================
        // ANALYTICS
        // ============================================

        /// <summary>
        /// Track an analytics event
        /// </summary>
        public IEnumerator TrackEvent(string projectId, string eventName,
            Dictionary<string, object> eventData, string playerId = null,
            Action<bool> callback = null)
        {
            var data = new Dictionary<string, object>
            {
                { "projectId", projectId },
                { "eventName", eventName },
                { "eventData", eventData }
            };

            if (!string.IsNullOrEmpty(playerId))
                data["playerId"] = playerId;

            yield return PostRequest("/analytics/track", data, (success, response) =>
            {
                if (success)
                {
                    Debug.Log($"[GameBackend] Event tracked: {eventName}");
                }
                callback?.Invoke(success);
            });
        }

        // ============================================
        // LEADERBOARDS
        // ============================================

        /// <summary>
        /// Submit a score to a leaderboard
        /// </summary>
        public IEnumerator SubmitScore(string projectId, string leaderboardName,
            string playerId, float score, Dictionary<string, object> metadata = null,
            Action<bool, int> callback = null)
        {
            var data = new Dictionary<string, object>
            {
                { "projectId", projectId },
                { "leaderboardName", leaderboardName },
                { "playerId", playerId },
                { "score", score }
            };

            if (metadata != null)
                data["metadata"] = metadata;

            yield return PostRequest("/leaderboards/submit", data, (success, response) =>
            {
                if (success)
                {
                    var jsonResponse = JsonUtility.FromJson<LeaderboardSubmitResponse>(response);
                    Debug.Log($"[GameBackend] Score submitted. Rank: {jsonResponse.leaderboard.rank}");
                    callback?.Invoke(true, jsonResponse.leaderboard.rank ?? 0);
                }
                else
                {
                    callback?.Invoke(false, 0);
                }
            });
        }

        /// <summary>
        /// Get leaderboard rankings
        /// </summary>
        public IEnumerator GetLeaderboard(string projectId, string leaderboardName,
            int limit = 100, Action<bool, LeaderboardEntry[]> callback = null)
        {
            string url = $"/leaderboards/projects/{projectId}/{leaderboardName}?limit={limit}";

            yield return GetRequest(url, (success, response) =>
            {
                if (success)
                {
                    var jsonResponse = JsonUtility.FromJson<LeaderboardResponse>(response);
                    callback?.Invoke(true, jsonResponse.leaderboard.entries);
                }
                else
                {
                    callback?.Invoke(false, null);
                }
            });
        }

        // ============================================
        // HTTP HELPERS
        // ============================================

        private IEnumerator PostRequest(string endpoint, Dictionary<string, object> data,
            Action<bool, string> callback)
        {
            string url = apiUrl + endpoint;
            string jsonData = JsonUtility.ToJson(new Wrapper { data = data });

            using (UnityWebRequest request = new UnityWebRequest(url, "POST"))
            {
                byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonData);
                request.uploadHandler = new UploadHandlerRaw(bodyRaw);
                request.downloadHandler = new DownloadHandlerBuffer();
                request.SetRequestHeader("Content-Type", "application/json");
                request.SetRequestHeader("X-API-Key", apiKey);

                if (!string.IsNullOrEmpty(accessToken))
                {
                    request.SetRequestHeader("Authorization", $"Bearer {accessToken}");
                }

                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    callback?.Invoke(true, request.downloadHandler.text);
                }
                else
                {
                    Debug.LogError($"[GameBackend] Request failed: {request.error}");
                    callback?.Invoke(false, request.error);
                }
            }
        }

        private IEnumerator GetRequest(string endpoint, Action<bool, string> callback)
        {
            string url = apiUrl + endpoint;

            using (UnityWebRequest request = UnityWebRequest.Get(url))
            {
                request.SetRequestHeader("X-API-Key", apiKey);

                if (!string.IsNullOrEmpty(accessToken))
                {
                    request.SetRequestHeader("Authorization", $"Bearer {accessToken}");
                }

                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    callback?.Invoke(true, request.downloadHandler.text);
                }
                else
                {
                    Debug.LogError($"[GameBackend] Request failed: {request.error}");
                    callback?.Invoke(false, request.error);
                }
            }
        }

        // ============================================
        // RESPONSE MODELS
        // ============================================

        [Serializable]
        private class Wrapper
        {
            public Dictionary<string, object> data;
        }

        [Serializable]
        private class LoginResponse
        {
            public PlayerInfo player;
            public string accessToken;
        }

        [Serializable]
        private class PlayerInfo
        {
            public string id;
            public string playerId;
            public string displayName;
        }

        [Serializable]
        private class PlayerDataResponse
        {
            public DataInfo data;
        }

        [Serializable]
        private class DataInfo
        {
            public string key;
            public string value;
        }

        [Serializable]
        private class LeaderboardSubmitResponse
        {
            public LeaderboardInfo leaderboard;
        }

        [Serializable]
        private class LeaderboardInfo
        {
            public string name;
            public float score;
            public int? rank;
        }

        [Serializable]
        private class LeaderboardResponse
        {
            public LeaderboardData leaderboard;
        }

        [Serializable]
        private class LeaderboardData
        {
            public string name;
            public LeaderboardEntry[] entries;
            public int totalEntries;
        }

        [Serializable]
        public class LeaderboardEntry
        {
            public int rank;
            public string playerId;
            public string playerDisplayName;
            public float score;
        }
    }
}
