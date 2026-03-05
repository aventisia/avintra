using System;
using System.Text;
using System.Text.Json;
using CodeActivitiesLibrary.Models;

namespace CodeActivitiesLibrary.Utils
{
    /// <summary>
    /// Utility class to decode a JWT access token and extract its payload as a strongly-typed object.
    /// </summary>
    /// <example>
    /// Example usage:
    /// <code>
    /// // Get the decoded access token object
    /// var decodedAccessToken = DecodeAccessToken.Decode(accessToken);
    ///
    /// // Access the username
    /// string userName = decodedAccessToken.UserName;
    /// 
    /// // Other properties can be accessed similarly:
    /// string userId = decodedAccessToken.UserId;
    /// string tenantId = decodedAccessToken.TenantId;
    /// List<string> roles = decodedAccessToken.Roles;
    /// Dictionary<string, object> permissions = decodedAccessToken.Permissions;
    /// 
    /// </code>
    /// </example>
    public static class DecodeAccessTokenUtil
    {
        /// <summary>
        /// Decodes a JWT access token and returns a strongly-typed object containing its claims.
        /// </summary>
        /// <param name="accessToken">The JWT access token string.</param>
        /// <returns>A <see cref="DecodedAccessTokenObj"/> containing the token's claims.</returns>
        /// <exception cref="ArgumentException">Thrown if the token is null, empty, or invalid.</exception>
        public static DecodedAccessTokenObj Decode(string accessToken)
        {
            if (string.IsNullOrWhiteSpace(accessToken))
                throw new ArgumentException("Access token cannot be null or empty.");

            var parts = accessToken.Split('.');
            if (parts.Length != 3)
                throw new ArgumentException("Invalid JWT token format.");

            var payload = parts[1];
            var json = Encoding.UTF8.GetString(Base64UrlDecode(payload));
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
            return JsonSerializer.Deserialize<DecodedAccessTokenObj>(json, options);
        }

        private static byte[] Base64UrlDecode(string input)
        {
            string output = input.Replace('-', '+').Replace('_', '/');
            switch (output.Length % 4)
            {
                case 2: output += "=="; break;
                case 3: output += "="; break;
            }
            return Convert.FromBase64String(output);
        }
    }
}