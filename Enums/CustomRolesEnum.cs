namespace AspNetToolkit.Enums;

/// <summary>
/// List of roles which user can have. Since this data will rarely change, we are keeping copies of this on the front-end and back-end to avoid API calls.
/// Any modification to this list will impact the following places:
/// - Front-end userRole list
/// - Database table of roles and M2M relationship of users-roles
/// - All the endpoints and UI components where user roles are required to restrict the usage.
/// </summary>
/// <remarks>
/// IMPORTANT NOTE 1: DO NOT REMOVE the semicolon from the description as it is being used here to split the description attribute value. 
/// </remarks>
public enum CustomRolesEnum
{
    /// <summary>
    /// Super administrator. This role should have access to everything.
    /// </summary>
    [Description("0; Super administrator; This role should have access to everything.")]
    SA,

    /// <summary>
    /// Global administrator. This role will have access to everything. The main purpose of this role is to assign GSA and GLBA roles to other users.
    /// </summary>
    [Description("1; Global administrator; This role will have access to everything. The main purpose of this role is to assign GSA and GLBA roles to other users.")]
    GA,

    /// <summary>
    /// Global settings administrator. This role will have access to support, app settings, users, groups, policies, setup, CRUD operations, all products, all tenants, all internal apps.
    /// </summary>
    [Description("2; Global settings administrator; This role will have access to support, app settings, users, groups, policies, setup, CRUD operations, all products, all tenants, all internal apps.")]
    GSA,

    /// <summary>
    /// Global license and billing administrator. This role will have access to handle billings, payments, license, subscription of individual user as well as all tenants.
    /// </summary>
    [Description("3; Global license and billing administrator; This role will have access to handle billings, payments, license, subscription of individual user as well as all tenants.")]
    GLBA,

    /// <summary>
    /// Tenant administrator. This role will have access to all things (within a specific Tenant) to which TSA, TLBA, and TU have access to. The main purpose of this role is to assign TSA, TLBA, and TA roles to other users.
    /// </summary>
    [Description("4; Tenant administrator; This role will have access to all things (within a specific Tenant) to which TSA, TLBA, and TU have access to. The main purpose of this role is to assign TSA, TLBA, and TA roles to other users.")]
    TA,

    /// <summary>
    /// Tenant settings administrator. This role will have similar access like GSA to manage a specific tenant.
    /// </summary>
    [Description("5; Tenant settings administrator; This role will have similar access like GSA to manage a specific tenant.")]
    TSA,

    /// <summary>
    /// Tenant license and billing administrator. This role will have similar access like GLBA to manage a specific tenant.
    /// </summary>
    [Description("6; Tenant license and billing administrator; This role will have similar access like GLBA to manage a specific tenant.")]
    TLBA,

    /// <summary>
    /// Tenant user. This role will be assigned to those users who will be using the products.
    /// </summary>
    [Description("7; Tenant user; This role will be assigned to those users who will be using the products.")]
    TU,

    /// <summary>
    /// Individual user. This role will be assigned automatically to those users who will be using the products and will be creating accounts as individual developers.
    /// </summary>
    [Description("8; Individual user; This role will be assigned automatically to those users who will be using the products and will be creating accounts as individual developers.")]
    IU,

    /// <summary>
    /// AVENTISIA employee. Role for an AVENTISIA Employee to access internal apps only as a normal user.
    /// </summary>
    [Description("9; AVENTISIA employee; Role for an AVENTISIA Employee to access internal apps only as a normal user.")]
    AE,
}