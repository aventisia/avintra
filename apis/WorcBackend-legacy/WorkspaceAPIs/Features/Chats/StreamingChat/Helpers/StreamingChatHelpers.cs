using WorkspaceAPIs.Features.Chats.StreamingChat.DTOs;

namespace WorkspaceAPIs.Helpers;

public static partial class StreamingChatHelpers
{
    private const int MaxDestinations = 60;

    [GeneratedRegex("^/[a-z0-9][a-z0-9/_-]{0,199}$")]
    private static partial Regex DestinationRouteRegex();

    [GeneratedRegex("^[^\\p{C}<>{}\\[\\]`]{1,80}$")]
    private static partial Regex DestinationLabelRegex();

    /// <summary>
    /// Builds the landing prompt section listing the pages the navigate tool may open,
    /// or null when the client sent none. Malformed entries are dropped because
    /// they come from the client and land in the system prompt.
    /// </summary>
    public static string? BuildLandingDestinationsPrompt(IEnumerable<ChatDestinationItem>? destinations)
    {
        var lines = (destinations ?? [])
            .Where(d => DestinationRouteRegex().IsMatch(d.Route ?? "") && DestinationLabelRegex().IsMatch(d.Label ?? ""))
            .DistinctBy(d => d.Route)
            .Take(MaxDestinations)
            .Select(d => $"{d.Route} — {d.Label.Trim()}")
            .ToList();
        if (lines.Count == 0) return null;

        return "Workspace pages this user can open (route — name):\n" + string.Join("\n", lines) + "\n" +
            "When the user wants to find, open, or set up something that lives on one of these pages, call workspace_navigate with its route " +
            "and say in one sentence what they can do there. Never mention a page that isn't listed.";
    }
}
