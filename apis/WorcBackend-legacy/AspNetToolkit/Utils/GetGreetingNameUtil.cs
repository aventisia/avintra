namespace AspNetToolkit.Utils;

public static class GetGreetingNameUtil
{
    /// <summary>
    /// Returns the user's first name, or their email when the first name is blank.
    /// </summary>
    public static string GetGreetingName(string? firstName, string? email) =>
        string.IsNullOrWhiteSpace(firstName) ? email ?? string.Empty : firstName;
}
