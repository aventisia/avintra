namespace GlobalAdminAPIs.Enums;

/// <summary>
/// Represents different types of emails that can be sent based on system events or actions.
/// </summary>
public enum EmailTypesEnum
{
    /// <summary>
    /// Email notification sent when a validation check has failed.
    /// </summary>
    [Description("Email sent when a validation check fails.")]
    ValidationCheckFailed,

    /// <summary>
    /// Email notification sent when the contract has expired.
    /// </summary>
    [Description("Email sent when the contract has expired.")]
    ContractExpiration,

    /// <summary>
    /// Email notification sent when authentication is disabled for a user or system.
    /// </summary>
    [Description("Email sent when authentication is disabled.")]
    AuthenticationDisabled,

    /// <summary>
    /// Email notification sent to inform about an upcoming contract renewal.
    /// </summary>
    [Description("Email sent to notify about an upcoming contract renewal.")]
    ContractRenewalReminder,

    /// <summary>
    /// Email notification sent when execution is disabled for a system or process.
    /// </summary>
    [Description("Email sent when execution is disabled.")]
    ExecutionDisabled,

    /// <summary>
    /// Email notification sent when execution time is running low or exceeds the allowed limit.
    /// </summary>
    [Description("Email sent when execution time is nearing the allowed limit.")]
    ExecutionTimeWarning,

    /// <summary>
    /// Email notification sent when a request is invalid (e.g., due to missing or invalid parameters).
    /// </summary>
    [Description("Email sent when a request is invalid, typically due to missing or incorrect parameters.")]
    InvalidRequest
}
