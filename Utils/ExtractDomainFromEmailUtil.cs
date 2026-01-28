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

    /// <summary>
    /// Extract the domain from a base URL (e.g., www.domain.com from https://www.domain.com/path)
    /// </summary>
    /// <param name="url">Full URL including protocol (e.g., "https://www.domain.com/path")</param>
    /// <returns>Domain (e.g., "www.domain.com") in lowercase, or an empty string if the URL is invalid</returns>
    public static string ExtractDomainFromUrl(string url)
    {
        string urlDomain = string.Empty;
        try
        {
            // url is null or empty
            if (string.IsNullOrEmpty(url)) return urlDomain;

            // If url doesn't start with http:// or https://, prepend http:// so Uri can parse it
            if (!url.StartsWith("http://", StringComparison.OrdinalIgnoreCase) &&
                !url.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            {
                url = "http://" + url;
            }

            // parse URL
            Uri uri = new Uri(url);

            // extract domain from Uri.Host
            urlDomain = uri.Host.ToLower().Trim();

            // Split the domain into parts
            var domainParts = urlDomain.Split('.');

            // If there are more than 2 parts (i.e., subdomain exists), we take only the last two parts
            if (domainParts.Length > 2)
            {
                urlDomain = string.Join('.', domainParts.Skip(domainParts.Length - 2));
            }
        }
        catch
        {
            return urlDomain;
        }

        return urlDomain;
    }
}