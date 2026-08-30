namespace NodeLibrary.HttpNodes;

[DisplayName("Download from Web"), Description("Downloads text or a file from the web and stores it in memory or saves it to a file.")]
[NodeMetadata(icon: "/assets/HTTP.svg")]
public class DownloadFromWebNode : BaseNode
{
    [DisplayName("URL"), Description("The URL of the resource to download (e.g., text, HTML, JSON, PDF).")]
    public required InArgument<string> Url { get; set; }

    [DisplayName("Save To File"), Description("If true, downloads and saves the content to a local file instead of returning as string.")]
    public InArgument<bool> SaveToFile { get; set; } = new InArgument<bool>(false);

    [DisplayName("File Path"), Description("Full path where the downloaded file should be saved. Required if 'Save To File' is true.")]
    [RenderIfCondition(nameof(SaveToFile), true)]
    public InArgument<string> FilePath { get; set; } = new InArgument<string>();

    [DisplayName("Timeout Seconds"), Description("Maximum time in seconds to wait before failing due to timeout.")]
    public InArgument<int> TimeoutSeconds { get; set; } = new InArgument<int>(60);

    [DisplayName("Result"), Description("Returns the downloaded content as string or file path depending on mode.")]
    public OutArgument<string> Result { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        var result = "";

        try
        {
            var url = Url.Get(context);
            var saveToFile = SaveToFile.Get(context);
            var filePath = FilePath.Get(context);
            var timeout = TimeSpan.FromSeconds(TimeoutSeconds.Get(context));

            if (string.IsNullOrWhiteSpace(url))
                throw new ArgumentException("URL must be specified.");

            if (saveToFile && string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("File path must be specified when saving to file.");

            using var client = new HttpClient();
            client.Timeout = timeout;

            var response = client.GetAsync(url).GetAwaiter().GetResult();

            if (response.IsSuccessStatusCode)
            {
                if (saveToFile)
                {
                    var content = response.Content.ReadAsByteArrayAsync().GetAwaiter().GetResult();
                    File.WriteAllBytes(filePath!, content);
                    result = filePath;
                    status = $"File successfully saved to '{filePath}'.";
                }
                else
                {
                    result = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
                    status = "Text content downloaded successfully.";
                }
            }
            else
            {
                status = $"Failed to download content: HTTP {(int)response.StatusCode} - {response.ReasonPhrase}";
                result = "";
            }

            Result.Set(context, result);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            Result.Set(context, result);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error downloading from web: {ex.Message}");
        }
    }
}
