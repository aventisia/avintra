namespace AspNetToolkit.Enums;

/// <summary>
/// Defines the different type of access that can be assigned.
/// </summary>
public enum PermissionAccessTypesEnum
{
    [Description("Grants complete access to all features and actions.")]
    FullAccess,

    [Description("Allows viewing data without making changes.")]
    View,

    [Description("Allows creating new records or entries.")]
    Create,

    [Description("Allows modifying existing records or entries.")]
    Edit,

    [Description("Allows removing or deleting records or entries.")]
    Delete
}
