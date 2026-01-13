namespace AccountsAPIs.Settings;

/// <summary>
/// Runtime settings for the application that can be changed while the server is running.
/// Controls execution, login, operation limits, and contract status.
/// </summary>
public class AppRuntimeSettings
{
    /// <summary>
    /// Gets or sets a value indicating whether execution processes are paused or blocked.
    /// </summary>
    public bool IsExecutionDisabled { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether users are prevented from logging in.
    /// </summary>
    public bool IsLoginDisabled { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether execution is allowed based on the maximum execution time.
    /// </summary>
    public bool ExecutionTimeAllowed { get; set; }

    /// <summary>
    /// Gets or sets the number of invalid checks performed.
    /// </summary>
    public int InvalidCheckCount { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the contract has expired.
    /// </summary>
    public bool IsContractExpired { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the contract has started.
    /// </summary>
    public bool IsContractStarted { get; set; }

    /// <summary>
    /// Gets or sets the type of tenant. It can either be an Enterprise or Commercial tenant.
    /// </summary>
    public OnPremTenantTypesEnum TenantType { get; set; }
}
