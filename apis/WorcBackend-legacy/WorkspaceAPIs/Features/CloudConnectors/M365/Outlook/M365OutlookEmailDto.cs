namespace WorkspaceAPIs.Features.CloudConnectors.M365.Outlook;

public class M365OutlookEmailDto
{
    public required JsonDocument RootEmail { get; set; }
    public List<JsonDocument>? NestedEmails { get; set; }
}