/* https://aspnano.com/build-multi-tenant-application-core-asp-net-7/
 * https://aspnano.com/asp-net-core-multi-tenant-app-multiple-databases-guide/
 * https://codewithmukesh.com/blog/multitenancy-in-aspnet-core/
*/

namespace AspNetToolkit.Services;

/// <summary>
/// Represents a service for managing the current tenant and user information for the current request.
/// </summary>
public interface ICurrentTenantService
{
    /// <summary>
    /// Gets or sets the ID of the current tenant for the current request.
    /// </summary>
    Guid CurrentTenantId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the current user for the current request.
    /// This property is required for applying global filters in the DbContext.
    /// </summary>
    Guid CurrentUserId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the current space for the current request.
    /// Guid.Empty indicates the default "Central" space (shared across the tenant).
    /// </summary>
    Guid CurrentSpaceId { get; set; }

    /// <summary>
    /// Gets the container name associated with the current tenant.
    /// </summary>
    string CurrentTenantContainerName { get; }

    /// <summary>
    /// Validates the provided tenant ID with the database and sets it as the current tenant ID.
    /// If the user ID is not Unknown, it also sets the user ID and generates a random GUID for the CurrentUserId property.
    /// </summary>
    /// <param name="tenantId">The ID of the tenant to set.</param>
    /// <param name="userId">The ID of the user to set.</param>
    /// <returns>A task that represents the asynchronous operation.
    /// The task result contains a string indicating the result of setting the current tenant and user.</returns>
    Task<string> SetTenantAndUser(string tenantId, string userId);
}