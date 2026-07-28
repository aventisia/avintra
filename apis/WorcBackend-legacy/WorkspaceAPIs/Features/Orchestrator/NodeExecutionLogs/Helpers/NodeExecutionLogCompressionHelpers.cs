using System.IO.Compression;
using System.Text;

namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Provides Brotli compression and decompression helpers for JSON payloads stored in ws_NodeExecutionLogs.
/// </summary>
public static class NodeExecutionLogCompressionHelpers
{
    private static readonly CompressionLevel DefaultCompressionLevel = CompressionLevel.Optimal;

    /// <summary>
    /// Compresses a JSON string using Brotli and returns the compressed byte array.
    /// Returns an empty array if the input is null or empty.
    /// </summary>
    public static byte[] CompressJson(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return [];

        var bytes = Encoding.UTF8.GetBytes(json);
        using var output = new MemoryStream();
        using (var brotli = new BrotliStream(output, DefaultCompressionLevel, leaveOpen: true))
        {
            brotli.Write(bytes, 0, bytes.Length);
        }
        return output.ToArray();
    }

    /// <summary>
    /// Decompresses a Brotli-compressed byte array back into a JSON string.
    /// Returns null if the input is null or empty.
    /// </summary>
    public static string? DecompressJson(byte[]? compressed)
    {
        if (compressed == null || compressed.Length == 0)
            return null;

        using var input = new MemoryStream(compressed);
        using var brotli = new BrotliStream(input, CompressionMode.Decompress, leaveOpen: true);
        using var reader = new StreamReader(brotli, Encoding.UTF8);
        return reader.ReadToEnd();
    }
}
