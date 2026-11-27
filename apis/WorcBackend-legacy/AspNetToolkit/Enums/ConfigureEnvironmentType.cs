namespace AspNetToolkit.Enums;

/// <summary>
/// Represents the deployment environment in which a configuration/record lives.
/// Request environments are <c>Dev</c> and <c>Prod</c>; <c>Any</c> is stored only on tenant-level vault credentials.
/// Persisted as the lowercase string ("dev"/"prod") via <see cref="Microsoft.EntityFrameworkCore.Storage.ValueConversion.EnumToStringConverter{TEnum}"/>.
/// </summary>
public enum ConfigureEnvironmentType
{
    /// <summary>
    /// Represents the development environment.
    /// </summary>
    Dev,

    /// <summary>
    /// Represents the production environment.
    /// </summary>
    Prod,

    /// <summary>
    /// Marks a tenant-level vault credential that works in every environment.
    /// Never resolved from a request.
    /// </summary>
    Any
}
