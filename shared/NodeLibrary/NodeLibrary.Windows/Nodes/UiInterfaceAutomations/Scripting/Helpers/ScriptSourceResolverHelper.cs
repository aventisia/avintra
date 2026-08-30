namespace NodeLibrary.ScriptingNodes.Helpers;

public static class ScriptSourceResolverHelper
{
    public static string Resolve(string source, string extension, out bool isTemporary)
    {
        isTemporary = false;

        if (File.Exists(source))
            return source;

        if (source.StartsWith(
            "data:",
            StringComparison.OrdinalIgnoreCase))
        {
            var index = source.IndexOf(',');

            var content = Encoding.UTF8.GetString(
                Convert.FromBase64String(
                    source.Substring(index + 1)));

            var temp =
                WriteTempFile(content, extension);

            isTemporary = true;
            return temp;
        }

        if (Uri.TryCreate(
            source,
            UriKind.Absolute,
            out var uri))
        {
            if (uri.Scheme == Uri.UriSchemeHttp ||
                uri.Scheme == Uri.UriSchemeHttps)
            {
                using (var client = new HttpClient())
                {
                    var content =
                        client.GetStringAsync(uri)
                              .GetAwaiter()
                              .GetResult();

                    var temp =
                        WriteTempFile(content, extension);

                    isTemporary = true;
                    return temp;
                }
            }

            if (uri.IsFile)
                return uri.LocalPath;
        }

        var inlineFile =
            WriteTempFile(source, extension);

        isTemporary = true;

        return inlineFile;
    }

    private static string WriteTempFile(string content, string extension)
    {
        var path = Path.Combine(
            Path.GetTempPath(),
            $"{Guid.NewGuid():N}{extension}");

        var encoding =
            extension.Equals(".vbs", StringComparison.OrdinalIgnoreCase)
                ? Encoding.ASCII
                : new UTF8Encoding(false);

        File.WriteAllText(path, content, encoding);

        return path;
    }
}
