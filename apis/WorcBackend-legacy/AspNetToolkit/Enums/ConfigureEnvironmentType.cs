namespace AspNetToolkit.Enums;

/// <summary>
/// Represents the deployment environment in which a configuration/record lives.
/// Supports exactly two values: <c>Dev</c> and <c>Prod</c>.
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
    Prod
}
