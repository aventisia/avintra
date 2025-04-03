using System.ComponentModel;

namespace AccountsAPIs.Enums;

/// <summary>
/// Represents the various statuses for license credits.
/// </summary>
public enum LicenseCreditStatusesEnum
{
    /// <summary>
    /// Indicates that the license credit has been requested and is awaiting approval from the relevant authority.
    /// </summary>
    [Description("Requested for approval")]
    Requested,

    /// <summary>
    /// Indicates that the license credit request is currently under review and has not yet been approved or denied.
    /// </summary>
    [Description("Pending approval")]
    Pending,

    /// <summary>
    /// Indicates that the license credit has been approved and is available for use by the requester.
    /// </summary>
    [Description("Approved for use")]
    Approved,

    /// <summary>
    /// Indicates that the license credit request has been reviewed and rejected, making it unusable.
    /// </summary>
    [Description("Rejected and not usable")]
    Rejected,

    /// <summary>
    /// Indicates that the license credit has expired and is no longer valid for use.
    /// </summary>
    [Description("Expired and no longer valid")]
    Expired
}
