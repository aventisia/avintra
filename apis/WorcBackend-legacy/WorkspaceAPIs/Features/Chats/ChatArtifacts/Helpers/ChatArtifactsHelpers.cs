namespace WorkspaceAPIs.Helpers;

public static class ChatArtifactsHelpers
{
    /// <summary>
    /// Maximum number of files accepted on a single chat message.
    /// </summary>
    public const int MaxFilesPerMessage = 3;

    /// <summary>
    /// Maximum accepted file size in bytes (10 MB).
    /// </summary>
    public const long MaxFileBytes = 10 * 1024 * 1024;

    /// <summary>
    /// Blob-name prefix of chat artifacts kept in Azure Blob Storage; other blob paths are data URLs.
    /// </summary>
    public const string BlobPrefix = "chat-artifacts/";

    private static readonly Dictionary<string, (string Name, string ContentType)> FileFences = new(StringComparer.OrdinalIgnoreCase)
    {
        ["html"] = ("Generated UI.html", "text/html"),
        ["svg"] = ("Image.svg", "image/svg+xml"),
        ["csv"] = ("Data.csv", "text/csv"),
        ["tsv"] = ("Data.tsv", "text/tab-separated-values"),
        ["markdown"] = ("Document.md", "text/markdown"),
        ["md"] = ("Document.md", "text/markdown"),
    };

    // IMPORTANT NOTE: mirrors findChatFile in @avplatform/chat; the browser matches a stored file to its reply by type and UTF-8 size, so both must extract the same body.
    private static readonly Regex FileFencePattern = new(
        @"^```(html|svg|csv|tsv|markdown|md)[ \t]*\n([\s\S]*?)^```[ \t]*$",
        RegexOptions.Multiline | RegexOptions.IgnoreCase);

    private static readonly Regex BareHtmlPattern = new(@"^(<!doctype html|<html[\s>])[\s\S]*</html>$", RegexOptions.IgnoreCase);
    private static readonly Regex TitlePattern = new(@"<title[^>]*>([^<]*)</title>", RegexOptions.IgnoreCase);
    private static readonly Regex MarkdownTitlePattern = new(@"^#[ \t]+(.+)$", RegexOptions.Multiline);
    private static readonly Regex UnsafeNameCharacters = new(@"[\\/:*?""<>|#]");

    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".pdf", ".doc", ".docx", ".txt", ".md",
        ".csv", ".tsv", ".json", ".xml",
        ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp",
        ".xls", ".xlsx", ".ppt", ".pptx",
    };

    private static readonly HashSet<string> DeniedMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "text/html",
        "text/javascript",
        "application/javascript",
    };

    // Model-generated files are platform output, not user uploads, so code
    // documents are allowed for them while uploads stay on the strict list.
    // Phase 2 extends this to the document/spreadsheet/presentation/PDF types
    // the workspace chat promises, reusing the text preview + summary fallback.
    private static readonly HashSet<string> AllowedGeneratedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".html", ".css", ".js", ".jsx", ".ts", ".tsx", ".json", ".md", ".txt", ".svg",
        ".csv", ".tsv", ".xml",
        ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
        ".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp",
    };

    /// <summary>
    /// Validates chat file references against the phase-1 upload limits, returning an error message or null.
    /// </summary>
    /// <param name="files">Data URLs or http(s) URLs attached to the message.</param>
    /// <returns></returns>
    public static string? ValidateFiles(IEnumerable<string>? files)
    {
        if (files is null)
            return null;

        var fileList = files.Where(f => !string.IsNullOrWhiteSpace(f)).ToList();

        if (fileList.Count > MaxFilesPerMessage)
            return $"A maximum of {MaxFilesPerMessage} files can be attached to a message.";

        foreach (var file in fileList)
        {
            var error = ValidateFile(file);
            if (error is not null)
                return error;
        }

        return null;
    }

    /// <summary>
    /// Checks a file extension against the phase-1 allowlist.
    /// </summary>
    /// <param name="extension">File extension including the leading dot.</param>
    /// <returns></returns>
    public static bool IsAllowedExtension(string extension) => AllowedExtensions.Contains(extension);

    /// <summary>
    /// Checks a file extension against the generated-artifact allowlist.
    /// </summary>
    /// <param name="extension">File extension including the leading dot.</param>
    /// <returns></returns>
    public static bool IsAllowedGeneratedExtension(string extension) => AllowedGeneratedExtensions.Contains(extension);

    /// <summary>
    /// Checks a media type against the generated-artifact allowlist.
    /// </summary>
    /// <param name="mimeType">Media type without parameters.</param>
    /// <returns></returns>
    public static bool IsAllowedGeneratedMimeType(string mimeType)
    {
        return mimeType.StartsWith("text/", StringComparison.OrdinalIgnoreCase) ||
            mimeType.Equals("application/json", StringComparison.OrdinalIgnoreCase) ||
            mimeType.Equals("application/pdf", StringComparison.OrdinalIgnoreCase) ||
            mimeType.Equals("application/xml", StringComparison.OrdinalIgnoreCase) ||
            mimeType.StartsWith("image/", StringComparison.OrdinalIgnoreCase) ||
            mimeType.Contains("officedocument", StringComparison.OrdinalIgnoreCase) ||
            mimeType.Contains("msword", StringComparison.OrdinalIgnoreCase) ||
            mimeType.Contains("ms-excel", StringComparison.OrdinalIgnoreCase) ||
            mimeType.Contains("ms-powerpoint", StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Checks a media type against the phase-1 allowlist.
    /// </summary>
    /// <param name="mimeType">Media type without parameters.</param>
    /// <returns></returns>
    public static bool IsAllowedMimeType(string mimeType)
    {
        if (DeniedMimeTypes.Contains(mimeType))
            return false;

        return mimeType.StartsWith("image/", StringComparison.OrdinalIgnoreCase) ||
            mimeType.StartsWith("text/", StringComparison.OrdinalIgnoreCase) ||
            mimeType.Equals("application/pdf", StringComparison.OrdinalIgnoreCase) ||
            mimeType.Equals("application/json", StringComparison.OrdinalIgnoreCase) ||
            mimeType.Equals("application/xml", StringComparison.OrdinalIgnoreCase) ||
            mimeType.Contains("officedocument", StringComparison.OrdinalIgnoreCase) ||
            mimeType.Contains("msword", StringComparison.OrdinalIgnoreCase) ||
            mimeType.Contains("ms-excel", StringComparison.OrdinalIgnoreCase) ||
            mimeType.Contains("ms-powerpoint", StringComparison.OrdinalIgnoreCase);
    }

    private static string? ValidateFile(string file)
    {
        if (file.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
            return ValidateDataUrl(file);

        if (Uri.TryCreate(file, UriKind.Absolute, out var uri) &&
            (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
        {
            var extension = Path.GetExtension(uri.AbsolutePath);
            return IsAllowedExtension(extension)
                ? null
                : $"File type '{extension}' is not supported.";
        }

        return "Unsupported file reference. Attach a file or an http(s) URL.";
    }

    private static string? ValidateDataUrl(string dataUrl)
    {
        var commaIndex = dataUrl.IndexOf(',');
        if (commaIndex < 0)
            return "Unsupported file reference. Attach a file or an http(s) URL.";

        var header = dataUrl.Substring("data:".Length, commaIndex - "data:".Length);
        var mimeType = header.Split(';')[0].Trim();
        if (!IsAllowedMimeType(mimeType))
            return $"File type '{mimeType}' is not supported.";

        return TryGetDataUrlSizeBytes(dataUrl, out var sizeBytes) && sizeBytes > MaxFileBytes
            ? "Each file must be 10 MB or smaller."
            : null;
    }

    /// <summary>
    /// Estimates the decoded byte size of a data URL without fully decoding it.
    /// </summary>
    /// <param name="dataUrl">Data URL to measure.</param>
    /// <param name="sizeBytes">Estimated decoded size in bytes.</param>
    /// <returns></returns>
    public static bool TryGetDataUrlSizeBytes(string dataUrl, out long sizeBytes)
    {
        sizeBytes = 0;
        var commaIndex = dataUrl.IndexOf(',');
        if (commaIndex < 0)
            return false;

        var base64 = dataUrl[(commaIndex + 1)..];
        var padding = base64.EndsWith("==") ? 2 : base64.EndsWith('=') ? 1 : 0;
        sizeBytes = base64.Length * 3L / 4 - padding;
        return true;
    }

    /// <summary>
    /// Finds the first complete file a landing reply wrote as a fenced block, or a reply that is a whole HTML page.
    /// </summary>
    /// <param name="replyText">The reply's full text.</param>
    /// <returns>The file, or null when the reply holds none.</returns>
    public static GeneratedChatFile? FindGeneratedFile(string replyText)
    {
        var trimmed = replyText.Trim();
        if (BareHtmlPattern.IsMatch(trimmed))
            return new GeneratedChatFile(NameFromContent(trimmed, FileFences["html"]), "text/html", trimmed);

        var match = FileFencePattern.Match(replyText);
        if (!match.Success)
            return null;

        var fence = FileFences[match.Groups[1].Value];
        var body = match.Groups[2].Value.Trim();
        return new GeneratedChatFile(NameFromContent(body, fence), fence.ContentType, body);
    }

    private static string NameFromContent(string body, (string Name, string ContentType) fence)
    {
        var titleMatch = fence.ContentType switch
        {
            "text/html" or "image/svg+xml" => TitlePattern.Match(body),
            "text/markdown" => MarkdownTitlePattern.Match(body),
            _ => Match.Empty,
        };
        var title = UnsafeNameCharacters.Replace(titleMatch.Success ? titleMatch.Groups[1].Value : string.Empty, string.Empty).Trim();
        if (title.Length > 60)
            title = title[..60];
        return title.Length > 0 ? title + Path.GetExtension(fence.Name) : fence.Name;
    }
}

/// <summary>
/// A file a landing reply wrote, ready to store as a generated chat artifact.
/// </summary>
/// <param name="Name">File name shown to the user.</param>
/// <param name="ContentType">File media type.</param>
/// <param name="Body">File text.</param>
public sealed record GeneratedChatFile(string Name, string ContentType, string Body);
