namespace AccountsAPIs.Authorization;

public class PermissionHandler : AuthorizationHandler<PermissionRequirement>
{
    private readonly IServiceScopeFactory _serviceScopeFactory;

     public  PermissionHandler(IServiceScopeFactory serviceScopeFactory)
     {
        _serviceScopeFactory = serviceScopeFactory;
     }      
    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, 
    PermissionRequirement requirement)
    {
        string? userId = context.User.Claims.FirstOrDefault(
            x => x.Type == JwtRegisteredClaimNames.Sub)?.Value;
        
        if(!Guid.TryParse(userId, out Guid parsedUserId))
            return;

        using IServiceScope scope = _serviceScopeFactory.CreateScope();
        
        IPermissionService permissionService = scope.ServiceProvider
        .GetRequiredService<IPermissionService>();

        var permissions = await permissionService.GetPermissionsAsync(parsedUserId);

        if(permissions.Contains(requirement.PermissionName))
            context.Succeed(requirement);
    }
}