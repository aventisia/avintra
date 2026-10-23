using NodeLibrary.TextNodes.Enums;

namespace NodeLibrary.TextNodes.Helpers;

/// <summary>Normalizes, decodes, and encodes Base64 text for the standard and URL-safe alphabets.</summary>
public static class Base64Helper
{
    /// <summary>Decodes Base64 text using the requested alphabet variant.</summary>
    public static byte[] Decode(string base64, Base64VariantEnum variant)
    {
        if (string.IsNullOrWhiteSpace(base64))
            throw new ArgumentException("Base64 string cannot be null or empty.", nameof(base64));

        var normalized = Regex.Replace(base64, @"\s+", "");
        var translated = Translate(normalized, variant);

        var mod4 = translated.Length % 4;
        if (mod4 == 1)
            throw new FormatException($"Invalid {VariantName(variant)} Base64 format: the value has an invalid length of {normalized.Length} characters.");

        if (mod4 != 0)
            translated = translated.PadRight(translated.Length + (4 - mod4), '=');

        return Convert.FromBase64String(translated);
    }

    /// <summary>Encodes bytes as Base64 text using the requested alphabet variant.</summary>
    public static string Encode(byte[] bytes, Base64VariantEnum variant)
    {
        var encoded = Convert.ToBase64String(bytes);

        return variant == Base64VariantEnum.UrlSafe
            ? encoded.Replace('+', '-').Replace('/', '_').TrimEnd('=')
            : encoded;
    }

    static string Translate(string base64, Base64VariantEnum variant)
    {
        switch (variant)
        {
            case Base64VariantEnum.Standard:
                if (base64.Contains('-') || base64.Contains('_'))
                    throw new FormatException("Invalid Standard Base64 format: the input uses the URL-safe alphabet ('-' or '_'). Set Base64 Variant to Auto or URL-safe to accept URL-safe input.");
                return base64;
            case Base64VariantEnum.UrlSafe:
                if (base64.Contains('+') || base64.Contains('/'))
                    throw new FormatException("Invalid URL-safe Base64 format: the input uses the standard alphabet ('+' or '/'). Set Base64 Variant to Auto or Standard to accept standard Base64 input.");
                return base64.Replace('-', '+').Replace('_', '/');
            default:
                return base64.Replace('-', '+').Replace('_', '/');
        }
    }

    static string VariantName(Base64VariantEnum variant) => variant switch
    {
        Base64VariantEnum.Standard => "Standard",
        Base64VariantEnum.UrlSafe => "URL-safe",
        _ => "Auto"
    };
}
