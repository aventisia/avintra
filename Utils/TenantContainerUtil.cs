using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text.RegularExpressions;

namespace AspNetToolkit.Utils;

public static class TenantContainerUtil
{
    private const int MaxPrefixLength = 20;
    private const int SuffixLength = 5;
    private const string AllowedChars = "abcdefghijklmnopqrstuvwxyz0123456789";

    /// <summary>
    /// Generates a safe, unique container name for a tenant.
    /// Format: {sanitized-tenant-name}-{random-suffix}
    /// </summary>
    /// <param name="tenantName">The tenant's display name.</param>
    /// <returns>A container-safe, lowercase container name.</returns>
    /// <exception cref="ArgumentException">Thrown when tenantName is null or empty.</exception>
    public static string GenerateName(string tenantName)
    {
        if (string.IsNullOrWhiteSpace(tenantName))
            throw new ArgumentException("Tenant name cannot be null or empty.", nameof(tenantName));

        // Normalize
        tenantName = tenantName.ToLowerInvariant();

        // Keep only letters, numbers, and spaces
        tenantName = Regex.Replace(tenantName, @"[^a-z0-9 ]", string.Empty);

        // Replace spaces with hyphens
        tenantName = Regex.Replace(tenantName, @"\s+", "-").Trim('-');

        // Limit prefix length
        var prefix = tenantName.Length > MaxPrefixLength
            ? tenantName[..MaxPrefixLength]
            : tenantName;

        // Generate cryptographically safe random suffix
        var suffix = GenerateRandomSuffix(SuffixLength);

        return $"{prefix}-{suffix}";
    }

    private static string GenerateRandomSuffix(int length)
    {
        var bytes = RandomNumberGenerator.GetBytes(length);
        return new string(bytes.Select(b => AllowedChars[b % AllowedChars.Length]).ToArray());
    }
}
