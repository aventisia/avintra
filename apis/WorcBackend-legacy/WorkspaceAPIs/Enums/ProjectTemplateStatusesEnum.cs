
namespace WorkspaceAPIs.Enums;

/// <summary>
/// Represents the approval status of a project template.
/// </summary>
public enum ProjectTemplateStatusesEnum
{
    /// <summary>
    /// The project template is awaiting review and approval.
    /// </summary>
    [Description("Pending for Approval")]
    Pending,

    /// <summary>
    /// The project template has been reviewed and approved.
    /// </summary>
    [Description("Approved")]
    Approved,

    /// <summary>
    /// The project template has been reviewed and rejected.
    /// </summary>
    [Description("Rejected")]
    Rejected
}