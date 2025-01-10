namespace AccountsAPIs.Authorization;

public sealed class HasPermissionAttribute : AuthorizeAttribute
{
    public HasPermissionAttribute(Auth permission)
    :base(policy: permission.ToString())
    {
    }
}