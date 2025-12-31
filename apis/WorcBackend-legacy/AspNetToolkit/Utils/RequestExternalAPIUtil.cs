namespace AspNetToolkit.Utils;

public static class RequestExternalAPIUtil
{
    public static async Task<HttpResponseMessage> RequestExternalAPI(CrudTypesEnum crudType, string url, string? jwt = null, object? content = null)
    {
        // Decide HttpMethod
        var method = crudType switch
        {
            CrudTypesEnum.Create => HttpMethod.Post,
            CrudTypesEnum.Read => HttpMethod.Get,
            CrudTypesEnum.Update => HttpMethod.Put,
            CrudTypesEnum.Delete => HttpMethod.Delete,
            _ => throw new NotImplementedException()
        };

        // Create HttpClient
        var httpClient = new HttpClient();

        // If jwt is not null
        if (jwt != null)
        {
            // Set the Bearer token in Authorization header
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwt);
        }

        // Create HttpRequestMessage
        var request = new HttpRequestMessage(method, url);

        // If content is not null
        if (content != null)
        {
            // Set content
            request.Content = new StringContent(JsonConvert.SerializeObject(content), Encoding.UTF8, "application/json");
        }

        // Send request
        return await httpClient.SendAsync(request);
    }
}