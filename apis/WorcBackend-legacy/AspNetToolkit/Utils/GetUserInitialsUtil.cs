namespace AspNetToolkit.Utils;

public static class GetUserInitialsUtil
{
    /// <summary>
    /// Converts user firstname and lastname to user's initial assuming first name and last name are going to have at least one char
    /// </summary>
    /// <param name="firstName">user's First Name</param>
    /// <param name="lastName">user's Last Name</param>
    /// <returns>Returns user's initials or "--" if there is any error</returns>
    public static string GetUserInitials(string firstName, string lastName)
    {
        try
        {
            return (firstName.Substring(0, 1) + lastName.Substring(0, 1)).ToUpper();
        }
        catch
        {
            // Return "--" if anything goes wrong
            return "--";
        }
    }

    /// <summary>
    /// Returns the user's initials, or the first letter of their email when both names are blank.
    /// </summary>
    public static string GetUserInitials(string firstName, string lastName, string? email) =>
        string.IsNullOrWhiteSpace(firstName) && string.IsNullOrWhiteSpace(lastName) && !string.IsNullOrEmpty(email)
            ? email[..1].ToUpper()
            : GetUserInitials(firstName, lastName);
}