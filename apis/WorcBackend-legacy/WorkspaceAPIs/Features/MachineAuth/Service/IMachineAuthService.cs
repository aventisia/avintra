namespace WorkspaceAPIs.Services;

/// <summary>
/// Service interface for machine registration and authentication.
/// </summary>
public interface IMachineAuthService
{
    /// <summary>
    /// Registers a machine and returns a JWT for its linked user account.
    /// </summary>
    /// <param name="machineAuthReqDto">The machine authentication details.</param>
    /// <returns>A service response containing the JWT, expiry and machine id.</returns>
    Task<ServiceResponse<MachineAuthResDto>> RegisterMachineAsync(MachineAuthReqDto machineAuthReqDto);

    /// <summary>
    /// Validates a registered machine and returns a JWT for its linked user account.
    /// </summary>
    /// <param name="machineAuthReqDto">The machine authentication details.</param>
    /// <returns>A service response containing the JWT, expiry and machine id.</returns>
    Task<ServiceResponse<MachineAuthResDto>> ValidateMachineAsync(MachineAuthReqDto machineAuthReqDto);
}
