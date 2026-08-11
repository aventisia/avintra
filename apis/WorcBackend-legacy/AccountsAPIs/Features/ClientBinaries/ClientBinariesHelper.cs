namespace AccountsAPIs.Helpers;

/// <summary>
/// Shared logic for serving client binaries (Desktop App and Runner App) from the
/// configured upload directory. Kept as a static helper so each binaries controller
/// can expose its own route without inheriting route attributes.
/// </summary>
public static class ClientBinariesHelper
{
    public const string DesktopPrefix = "AvintraDesktopApp";
    public const string DesktopSuffix = "x64-setup.exe";
    public const string RunnerPrefix = "AvintraRunnerService";
    public const string RunnerSuffix = "win-x64.zip";

    // Helper to get the latest version from a file or database
    public static (string?, string?, string?, string) GetLatestVersion(
        AppDefaultConfig appDefaultConfig,
        string prefix,
        string suffix,
        string? version = null)
    {
        // Get base path
        var basePath = Path.Combine(appDefaultConfig.FileUploadConfig.UploadDirectory, "binaries");

        // Ensure the latest folder exists
        if (!Directory.Exists(basePath))
            return (null, null, null, "Binary folder not found.");

        // Initialize search pattern
        var searchPattern = string.Empty;

        // Set search pattern based on version
        if (!string.IsNullOrEmpty(version))
            searchPattern = $"{prefix}_{version}_{suffix}";
        else
            searchPattern = $"{prefix}_*_{suffix}";

        // Get files matching the search pattern
        var files = Directory.GetFiles(basePath, searchPattern);

        // File not found
        if (files.Length == 0)
            return (null, null, null, "No versions available.");

        // Sort files by parsed version (newest first) and take the latest one.
        // Creation time is unreliable on Linux and rsync preserves mtime, so we
        // sort semantically by the version embedded in the file name.
        var latestFilePath = files
            .OrderByDescending(f => ParseVersion(Path.GetFileName(f), prefix, suffix), Comparer<string>.Create(CompareVersions))
            .First();
        var fileName = Path.GetFileName(latestFilePath);

        // Get the signature file path
        var signatureFilePath = Path.Combine(basePath, $"{fileName}.sig");

        // Check if the signature file exists
        if (suffix == "x64-setup.exe" && !System.IO.File.Exists(signatureFilePath))
            return (null, null, null, "Signature file not found for the latest version.");

        // Return the latest file path, file name, and success message
        return (latestFilePath, fileName, signatureFilePath, "Latest version found.");
    }

    // Extracts the version segment from a file name like "{prefix}_{version}_{suffix}".
    public static string ParseVersion(string fileName, string prefix, string suffix)
    {
        var name = Path.GetFileNameWithoutExtension(fileName);
        var suffixWithoutExtension = Path.GetFileNameWithoutExtension(suffix);
        var prefixPart = $"{prefix}_";
        var suffixPart = $"_{suffixWithoutExtension}";

        if (name.StartsWith(prefixPart, StringComparison.OrdinalIgnoreCase))
            name = name.Substring(prefixPart.Length);

        if (name.EndsWith(suffixPart, StringComparison.OrdinalIgnoreCase))
            name = name.Substring(0, name.Length - suffixPart.Length);

        return name;
    }

    // Compares two version strings semantically (e.g. "0.1.9" < "0.1.10").
    // Falls back to ordinal comparison when a segment is not numeric.
    public static int CompareVersions(string? x, string? y)
    {
        if (string.IsNullOrEmpty(x) && string.IsNullOrEmpty(y)) return 0;
        if (string.IsNullOrEmpty(x)) return -1;
        if (string.IsNullOrEmpty(y)) return 1;

        var xParts = x.Split('.');
        var yParts = y.Split('.');
        var length = Math.Max(xParts.Length, yParts.Length);

        for (var i = 0; i < length; i++)
        {
            var xPart = i < xParts.Length ? xParts[i] : "0";
            var yPart = i < yParts.Length ? yParts[i] : "0";

            if (int.TryParse(xPart, out var xNum) && int.TryParse(yPart, out var yNum))
            {
                if (xNum != yNum) return xNum.CompareTo(yNum);
            }
            else
            {
                var cmp = string.Compare(xPart, yPart, StringComparison.Ordinal);
                if (cmp != 0) return cmp;
            }
        }

        return 0;
    }

    // Returns every discovered version for the given prefix/suffix, sorted newest first by version.
    public static List<(string filePath, string fileName, string? signatureFilePath, string version)> GetAllVersions(
        AppDefaultConfig appDefaultConfig,
        string prefix,
        string suffix)
    {
        var basePath = Path.Combine(appDefaultConfig.FileUploadConfig.UploadDirectory, "binaries");
        if (!Directory.Exists(basePath))
            return new List<(string filePath, string fileName, string? signatureFilePath, string version)>();

        var searchPattern = $"{prefix}_*_{suffix}";
        var files = Directory.GetFiles(basePath, searchPattern)
            .OrderByDescending(f => ParseVersion(Path.GetFileName(f), prefix, suffix), Comparer<string>.Create(CompareVersions))
            .ToList();

        return files.Select(filePath =>
        {
            var fileName = Path.GetFileName(filePath);
            var signatureFilePath = Path.Combine(basePath, $"{fileName}.sig");
            var hasSignature = System.IO.File.Exists(signatureFilePath);
            var version = ParseVersion(fileName, prefix, suffix);
            return (filePath, fileName, hasSignature ? signatureFilePath : null, version);
        }).ToList();
    }

    public static ProductManifestDto GetProductManifest(
        AppDefaultConfig appDefaultConfig,
        EnvironmentConfig environmentConfig,
        string prefix,
        string suffix,
        string installerType)
    {
        var isDesktopApp = suffix == "x64-setup.exe";
        var downloadPath = isDesktopApp ? "desktop/download" : "runner/download";
        var versions = GetAllVersions(appDefaultConfig, prefix, suffix);

        if (versions.Count == 0)
        {
            return new ProductManifestDto
            {
                Versions =
                [
                    new ProductVersionDto
                    {
                        Version = string.Empty,
                        Notes = "No versions available.",
                        Artifacts = GetPlaceholderArtifacts(installerType)
                    }
                ]
            };
        }

        var versionDtos = versions
            .Select(v => BuildProductVersionDto(environmentConfig, v, installerType, isDesktopApp, downloadPath))
            .ToList();

        return new ProductManifestDto { Versions = versionDtos };
    }

    public static ProductVersionDto BuildProductVersionDto(
        EnvironmentConfig environmentConfig,
        (string filePath, string fileName, string? signatureFilePath, string version) versionInfo,
        string installerType,
        bool isDesktopApp,
        string downloadPath)
    {
        var hasFile = !string.IsNullOrEmpty(versionInfo.filePath);
        var version = versionInfo.version;
        var baseUrl = $"https://{environmentConfig.AppBaseUrl}/files/binaries/{downloadPath}/{version}";

        var windowsArtifact = new ArtifactDto
        {
            Platform = "windows",
            Architecture = "x86_64",
            Available = hasFile,
            InstallerType = installerType,
            Size = hasFile ? new FileInfo(versionInfo.filePath).Length : null,
            Url = hasFile ? baseUrl : string.Empty,
            SignatureUrl = isDesktopApp && hasFile && !string.IsNullOrEmpty(versionInfo.signatureFilePath)
                ? $"{baseUrl}.sig"
                : null
        };

        return new ProductVersionDto
        {
            Version = version,
            Notes = "Bug fixes and improvements.",
            Artifacts =
            [
                windowsArtifact,
                new ArtifactDto { Platform = "linux", Architecture = "x86_64", Available = false },
                new ArtifactDto { Platform = "macos", Architecture = "x86_64", Available = false },
                new ArtifactDto { Platform = "macos", Architecture = "arm64", Available = false }
            ]
        };
    }

    public static List<ArtifactDto> GetPlaceholderArtifacts(string installerType)
    {
        return
        [
            new ArtifactDto
            {
                Platform = "windows",
                Architecture = "x86_64",
                Available = false,
                InstallerType = installerType,
                Url = string.Empty,
                SignatureUrl = null
            },
            new ArtifactDto { Platform = "linux", Architecture = "x86_64", Available = false },
            new ArtifactDto { Platform = "macos", Architecture = "x86_64", Available = false },
            new ArtifactDto { Platform = "macos", Architecture = "arm64", Available = false }
        ];
    }
}
