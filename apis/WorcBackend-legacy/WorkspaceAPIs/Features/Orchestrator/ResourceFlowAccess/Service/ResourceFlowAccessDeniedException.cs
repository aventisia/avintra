namespace WorkspaceAPIs.Services;

public class ResourceFlowAccessDeniedException : InvalidOperationException
{
    public ResourceFlowAccessDeniedException(string message) : base(message)
    {
    }
}
