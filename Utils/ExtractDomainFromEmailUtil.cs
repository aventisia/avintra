namespace AspNetToolkit.Utils;

public static class ExtractDomainFromEmailUtil
{
    /// <summary>
    /// Extract domain name from provided email address
    /// </summary>
    /// <param name="email">full email address</param>
    /// <returns>domain.com part of email in lowercase</returns>
    public static string ExtractDomainFromEmail(string email)
    {
        string emailDomain = string.Empty;
        try
        {
            // email is null or empty
            if (string.IsNullOrEmpty(email)) return emailDomain;

            // email doesn't contain @
            if (!email.Contains("@")) return emailDomain;

            // extract email domain
            emailDomain = email.ToLower().Split('@')[1];

            // trim extracted domain
            emailDomain.Trim();
        }
        catch
        {
            return emailDomain;
        }
        return emailDomain;
    }
}