namespace AccountsAPIs.Services;

/// <summary>
/// Provides operations for serving client binaries (Desktop App and Runner App).
/// </summary>
public interface IClientBinariesService
{
    /// <summary>
    /// Retrieves the download manifest listing every available version of the Desktop App and Runner App.
    /// </summary>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the <see cref="DownloadManifestDto"/>.
    /// </returns>
    Task<ServiceResponse<DownloadManifestDto>> GetDownloadManifestAsync();

    /// <summary>
    /// Retrieves the latest available version of the Runner App.
    /// </summary>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the <see cref="RunnerLatestDto"/>.
    /// </returns>
    Task<ServiceResponse<RunnerLatestDto>> GetRunnerAppLatestAsync();

    /// <summary>
    /// Checks whether an update is available for the Desktop App at the given current version.
    /// </summary>
    /// <param name="target">The update target (unused; reserved for future use).</param>
    /// <param name="arch">The target architecture (unused; reserved for future use).</param>
    /// <param name="currentVersion">The currently installed version of the Desktop App.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the <see cref="UpdateCheckDto"/>
    /// when an update is available, or a 204 response with null data when the app is up to date.
    /// </returns>
    Task<ServiceResponse<UpdateCheckDto>> CheckUpdateAsync(string target, string arch, string currentVersion);

    /// <summary>
    /// Resolves the latest (or a specific) Desktop App binary for download.
    /// </summary>
    /// <param name="version">An optional specific version to download; when null, the latest is used.</param>
    /// <returns>A <see cref="BinaryFileResult"/> describing the file to stream.</returns>
    BinaryFileResult GetDesktopDownload(string? version);

    /// <summary>
    /// Resolves the signature file for a specific Desktop App version.
    /// </summary>
    /// <param name="version">The version whose signature should be downloaded.</param>
    /// <returns>A <see cref="BinaryFileResult"/> describing the signature file to stream.</returns>
    BinaryFileResult GetDesktopSignature(string version);

    /// <summary>
    /// Resolves the latest (or a specific) Runner App binary for download.
    /// </summary>
    /// <param name="version">An optional specific version to download; when null, the latest is used.</param>
    /// <returns>A <see cref="BinaryFileResult"/> describing the file to stream.</returns>
    BinaryFileResult GetRunnerDownload(string? version);

    /// <summary>
    /// Resolves the Runner App installation PowerShell script.
    /// </summary>
    /// <returns>A <see cref="BinaryFileResult"/> describing the script to stream.</returns>
    BinaryFileResult GetInstallScript();
}
