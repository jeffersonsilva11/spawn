// Game Backend SDK for Unity
// See docs/unity-sdk-guide.md for complete documentation and examples

using System;
using System.Threading.Tasks;
using UnityEngine;
using UnityEngine.Networking;

namespace GameBackendSDK
{
    /// <summary>
    /// Main SDK client for communicating with Game Backend Platform
    /// </summary>
    public class GameBackendClient
    {
        private readonly string apiUrl;
        private readonly string apiKey;

        /// <summary>
        /// Initialize the Game Backend SDK client
        /// </summary>
        /// <param name="apiUrl">Backend API URL (e.g., http://localhost:3000)</param>
        /// <param name="apiKey">Studio API key from web panel</param>
        public GameBackendClient(string apiUrl, string apiKey)
        {
            this.apiUrl = apiUrl?.TrimEnd('/') ?? throw new ArgumentNullException(nameof(apiUrl));
            this.apiKey = apiKey ?? throw new ArgumentNullException(nameof(apiKey));
        }

        /// <summary>
        /// Get an available server instance for the project
        /// </summary>
        /// <param name="projectId">Project UUID</param>
        /// <returns>Server connection information</returns>
        public async Task<ServerInfo> GetServer(string projectId)
        {
            if (string.IsNullOrEmpty(projectId))
            {
                throw new ArgumentNullException(nameof(projectId));
            }

            string url = $"{apiUrl}/sdk/projects/{projectId}/server";

            using (UnityWebRequest request = UnityWebRequest.Get(url))
            {
                request.SetRequestHeader("X-API-Key", apiKey);
                request.SetRequestHeader("Content-Type", "application/json");

                var operation = request.SendWebRequest();

                while (!operation.isDone)
                {
                    await Task.Yield();
                }

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

    /// <summary>
    /// Server connection information
    /// </summary>
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

    /// <summary>
    /// SDK exception for error handling
    /// </summary>
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
