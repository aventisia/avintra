using System.Security.Claims;
using AspNetToolkit.Config;
using AspNetToolkit.DTOs;
using AspNetToolkit.Enums;
using Microsoft.EntityFrameworkCore;
using WorkspaceAPIs.Entities;
using WorkspaceAPIs.Features.Corsair;
using WorkspaceAPIs.Repos;
using WorkspaceAPIs.Services;

namespace WorkspaceAPIs.Features.Corsair;

/// <summary>
/// Invokes Corsair plugin operations from workflow nodes.
///
/// The caller is authenticated via the platform JWT. The credential is resolved
/// by name through the Vault (AppSecret) service, which enforces tenant, space,
/// environment, disabled-state, and resource-share authorization. The dotted
/// sidecar action is resolved from the generated <c>CorsairActionMap.json</c>
/// file (never reconstructed from a display name), then the operation is invoked
/// on the private Corsair sidecar.
/// </summary>
public interface ICorsairInvokeService
{
    Task<ServiceResponse<CorsairInvokeResDto>> InvokeAsync(CorsairInvokeReqDto request);
}

public class CorsairInvokeService : ICorsairInvokeService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CorsairInvokeService> _logger;
    private readonly ICorsairSidecarService _corsairSidecarService;
    private readonly CorsairConfigRepository _configRepository;
    private readonly IResourceShareService _resourceShareService;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly Guid _userId;

    public CorsairInvokeService(
        IUnitOfWork unitOfWork,
        ILogger<CorsairInvokeService> logger,
        IHttpContextAccessor httpContextAccessor,
        IResourceShareService resourceShareService,
        ICurrentTenantService currentTenantService,
        ICorsairSidecarService corsairSidecarService,
        CorsairConfigRepository configRepository)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _resourceShareService = resourceShareService;
        _currentTenantService = currentTenantService;
        _corsairSidecarService = corsairSidecarService;
        _configRepository = configRepository;
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

    public async Task<ServiceResponse<CorsairInvokeResDto>> InvokeAsync(CorsairInvokeReqDto request)
    {
        var serviceResponse = new ServiceResponse<CorsairInvokeResDto>
        {
            Data = null,
            Message = "Failed to invoke integration operation."
        };

        try
        {
            if (string.IsNullOrWhiteSpace(request.Plugin) || string.IsNullOrWhiteSpace(request.Action) || string.IsNullOrWhiteSpace(request.CredentialName))
            {
                serviceResponse.Message = "Plugin, action, and credential name are required.";
                return serviceResponse;
            }

            // Resolve the credential by name within the current tenant/space/environment.
            var appSecret = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w =>
                    w.Name == request.CredentialName &&
                    !w.IsDisabled &&
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.EnvType == _currentTenantService.CurrentEnvType)
                .AsNoTracking()
                .Include(i => i.EncryptedKeyValues)
                .SingleOrDefaultAsync();

            if (appSecret == null)
            {
                serviceResponse.Message = "Credential not found or is disabled.";
                return serviceResponse;
            }

            // Enforce resource-share authorization (owner/view/edit).
            var (canView, _) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                appSecret.Id,
                ResourceTypeEnum.AppSecret,
                appSecret.CreatedByUserId,
                appSecret.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                });

            if (!canView)
            {
                _logger.LogWarning("User {UserId} is not authorized to invoke Corsair with credential {CredentialName}", _userId, request.CredentialName);
                serviceResponse.Message = "You do not have access to this credential.";
                return serviceResponse;
            }

            // Validate the requested plugin/action against the credential type.
            var plugin = MapAppSecretTypeToCorsairPlugin(appSecret.Type);
            if (string.IsNullOrWhiteSpace(plugin) || !string.Equals(plugin, request.Plugin, StringComparison.OrdinalIgnoreCase))
            {
                serviceResponse.Message = $"Credential type does not support plugin '{request.Plugin}'.";
                return serviceResponse;
            }

            // Resolve the exact dotted sidecar action from the generated action
            // map. The node passes the PascalCase action segment (e.g.
            // "ApiIssuesList"); the map carries the real dotted operation
            // (e.g. "api.issues.list").
            var nodeName = $"Corsair/{char.ToUpperInvariant(plugin[0]) + plugin[1..]}/{request.Action}";
            var invocation = _configRepository.GetInvocation(nodeName);
            var dottedAction = invocation?.Action;
            if (string.IsNullOrWhiteSpace(dottedAction))
            {
                serviceResponse.Message = $"No invocation metadata found for plugin '{plugin}' action '{request.Action}'.";
                return serviceResponse;
            }

            var result = await _corsairSidecarService.InvokeAsync(
                appSecret.Id,
                plugin,
                dottedAction,
                request.Payload);

            serviceResponse.Data = new CorsairInvokeResDto
            {
                Success = result.Success,
                Data = result.Data,
                Error = result.Error,
                Details = result.Details,
                NeedsConnect = result.NeedsConnect,
                Plugin = result.Plugin,
                AuthType = result.AuthType,
                ApprovalRequired = result.ApprovalRequired,
                Message = result.Message
            };

            serviceResponse.StatusCode = result.Success ? 200 : 400;
            serviceResponse.Message = result.Success ? "Integration operation invoked successfully." : (result.Error ?? "Integration operation failed.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while invoking Corsair operation for credential {CredentialName}.", request.CredentialName);
        }

        return serviceResponse;
    }

    /// <summary>
    /// Maps an <see cref="AppSecretTypesEnum"/> to the corresponding Corsair plugin identifier.
    /// Returns <c>null</c> when the type does not correspond to a Corsair-supported plugin.
    /// </summary>
    private static string? MapAppSecretTypeToCorsairPlugin(AppSecretTypesEnum type)
    {
        return type switch
        {
            AppSecretTypesEnum.GitHub => "github",
            AppSecretTypesEnum.M365 => "outlook",
            AppSecretTypesEnum.SendGrid => "resend",
            AppSecretTypesEnum.Twilio => "twilio",
            _ => null
        };
    }
}
