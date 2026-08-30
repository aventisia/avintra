namespace NodeLibrary.FileNodes;

[DisplayName("Extract File Text"), Description("Extracts text from a file using the Aventisia cloud API. Supported formats: .pdf, .png, .jpg, .jpeg, .bmp, .tiff, .tif, .docx, .xlsx, .txt, .csv, .rtf, .odt, .md")]
[NodeMetadata(icon: "/assets/File.svg")]
public class ExtractFileTextNode : BaseNode
{
    [DisplayName("File path"), Description("Path to the file to be uploaded and processed. Supported formats: .pdf, .png, .jpg, .jpeg, .bmp, .tiff, .tif, .docx, .xlsx, .txt, .csv, .rtf, .odt, .md")]
    public required InArgument<string> FilePath { get; set; }

    [DisplayName("Extracted Text"), Description("Extracted text returned by the Aventisia cloud API.")]
    public OutArgument<string> ExtractedText { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var callerContext = CallerContext.Get(context) ?? throw new InvalidOperationException("Caller context is required");
            var baseUrl = callerContext.AppBaseUrl ?? throw new InvalidOperationException("App base URL is required");
            var apiUrl = $"{baseUrl}/llmpipeline/api/extract-file-text";
            var filePath = FilePath.Get(context);
            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("File path is required.", nameof(FilePath));

            var formattedFile = FormatFile(filePath);

            var requestObj = new
            {
                file = formattedFile,
            };

            var json = JsonSerializer.Serialize(requestObj);
            using var client = new HttpClient();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", callerContext.AccessToken);

            var content = new StringContent(json, Encoding.UTF8, "application/json");
            var response = client.PostAsync(apiUrl, content).GetAwaiter().GetResult();
            response.EnsureSuccessStatusCode();

            var extractedText = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
            ExtractedText.Set(context, extractedText);
            status = "Text extraction request succeeded.";

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            ExtractedText.Set(context, "No text returned.");
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error: {ex.GetBaseException().Message}");
        }
    }


    private string FormatFile(string filePath)
    {
        // If file is remote file with http/https, return as is
        if (Uri.IsWellFormedUriString(filePath, UriKind.Absolute) &&
            (filePath.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
             filePath.StartsWith("https://", StringComparison.OrdinalIgnoreCase)))
        {
            return filePath;
        }

        // If string is already in Data URI base64 format, use it directly (raw base64 strings are not accepted, it must be in data URI format)
        if (IsDataUriBase64(filePath))
            return filePath;

        // Otherwise, treat as file path - validate file existence
        var sanitizedPath = filePath.Trim('[').Trim(']').Trim('"').Trim();
        if (!File.Exists(sanitizedPath))
            throw new FileNotFoundException("File not found.", sanitizedPath);

        var mimeType = AllowedMimeType(Path.GetExtension(sanitizedPath));
        if (string.IsNullOrWhiteSpace(mimeType))
            throw new NotSupportedException($"Unsupported file type: {Path.GetExtension(sanitizedPath)}");

        // Read file and convert to base64
        var fileBytes = File.ReadAllBytes(sanitizedPath);
        var fileBase64 = Convert.ToBase64String(fileBytes);

        return $"data:{mimeType};base64,{fileBase64}";
    }

    private static bool IsDataUriBase64(string str)
    {
        if (string.IsNullOrWhiteSpace(str))
            return false;

        return str.Trim().StartsWith("data:", StringComparison.OrdinalIgnoreCase) &&
               str.IndexOf(";base64,", StringComparison.OrdinalIgnoreCase) > 5;
    }

    private static string? AllowedMimeType(string fileExtension)
    {
        switch (fileExtension.ToLower())
        {
            case ".pdf": return "application/pdf";
            case ".png": return "image/png";
            case ".jpg": return "image/jpeg";
            case ".jpeg": return "image/jpeg";
            case ".bmp": return "image/bmp";
            case ".tiff": return "image/tiff";
            case ".tif": return "image/tiff";
            case ".docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case ".xlsx": return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case ".txt": return "text/plain";
            case ".csv": return "text/csv";
            case ".rtf": return "text/rtf";
            case ".odt": return "application/vnd.oasis.opendocument.text";
            case ".md": return "text/markdown";
            default: return null;
        }
    }
}
