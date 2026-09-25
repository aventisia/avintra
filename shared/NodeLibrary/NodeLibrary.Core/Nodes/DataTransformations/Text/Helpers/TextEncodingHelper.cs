using NodeLibrary.TextNodes.Enums;

namespace NodeLibrary.TextNodes.Helpers;

/// <summary>
/// Maps <see cref="TextEncodingEnum"/> values to the corresponding <see cref="Encoding"/> instance.
/// </summary>
public static class TextEncodingHelper
{
    public static Encoding ToEncoding(TextEncodingEnum textEncoding) => textEncoding switch
    {
        TextEncodingEnum.Utf8 => Encoding.UTF8,
        TextEncodingEnum.Utf16 => Encoding.Unicode,
        TextEncodingEnum.Utf16BE => Encoding.BigEndianUnicode,
        TextEncodingEnum.Utf32 => Encoding.UTF32,
        TextEncodingEnum.Ascii => Encoding.ASCII,
        _ => throw new ArgumentOutOfRangeException(nameof(textEncoding), textEncoding, "Unsupported text encoding.")
    };
}
