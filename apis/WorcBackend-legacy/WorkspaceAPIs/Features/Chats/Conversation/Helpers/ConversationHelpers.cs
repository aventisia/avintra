using System.Net;

namespace WorkspaceAPIs.Helpers;

public static partial class ConversationHelpers
{
    public const int LandingTitleMaxLength = 80;

    private const string UntitledLandingTitle = "Untitled chat";

    [GeneratedRegex("<attachment name=\"([^\"]*)\">\\n[\\s\\S]*?\\n</attachment>")]
    private static partial Regex AttachmentBlockRegex();

    [GeneratedRegex("\\s+")]
    private static partial Regex WhitespaceRegex();

    /// <summary>
    /// Builds a landing conversation title from its first user message: the text without inlined
    /// attachments, else the first attachment's name, shortened at a word boundary.
    /// </summary>
    public static string BuildLandingTitle(string? userInput)
    {
        var input = userInput ?? "";
        var text = WhitespaceRegex().Replace(AttachmentBlockRegex().Replace(input, " "), " ").Trim();
        if (text.Length == 0)
        {
            var attachment = AttachmentBlockRegex().Match(input);
            text = attachment.Success ? WebUtility.HtmlDecode(attachment.Groups[1].Value).Trim() : "";
        }
        if (text.Length == 0)
            return UntitledLandingTitle;
        if (text.Length <= LandingTitleMaxLength)
            return text;

        var cut = text[..LandingTitleMaxLength];
        var lastSpace = cut.LastIndexOf(' ');
        return (lastSpace > LandingTitleMaxLength / 2 ? cut[..lastSpace] : cut).TrimEnd() + "…";
    }
}
