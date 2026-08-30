using System.Security;

namespace NodeLibrary.Helpers;

public static class NodeLogHelperWindows
{
    public static void Register()
    {
        NodeLogHelper.PlatformSpecificConvertValueForLogging = (key, value, inOrOut) =>
        {
            return value switch
            {
                FlaUI.Core.AutomationElements.AutomationElement _ => $"[AutomationElement] {key}",
                Microsoft.Data.SqlClient.SqlConnection _ => $"[SqlConnection] {key}",
                SecureString _ => $"[Secure{inOrOut}] {key}",
                _ => null,
            };
        };
    }
}
