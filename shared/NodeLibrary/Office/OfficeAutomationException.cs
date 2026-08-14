namespace NodeLibrary.Office;

/// <summary>
/// Thrown when an Office desktop application (Excel or Word) cannot be activated or used
/// via COM late binding. The message is intended to be user-facing and actionable.
/// </summary>
public sealed class OfficeAutomationException : InvalidOperationException
{
    public OfficeApplication Application { get; }
    public string Operation { get; }

    public OfficeAutomationException(OfficeApplication application, string operation, Exception innerException)
        : base(BuildMessage(application, operation, innerException), innerException)
    {
        Application = application;
        Operation = operation;
    }

    private static string BuildMessage(OfficeApplication application, string operation, Exception innerException)
    {
        var appName = GetDisplayName(application);
        var innerMessage = innerException?.Message is { Length: > 0 } msg
            ? msg
            : "No additional details available.";

        return $"Microsoft {appName} is not available or could not be used for '{operation}'. " +
               $"Please ensure {appName} (2013 or newer) is installed and licensed, then try again. " +
               $"Details: {innerMessage}";
    }

    private static string GetDisplayName(OfficeApplication application) => application switch
    {
        OfficeApplication.Excel => "Excel",
        OfficeApplication.Word => "Word",
        _ => application.ToString(),
    };
}
