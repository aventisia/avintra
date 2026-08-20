using System.Linq.Expressions;
using AspNetToolkit.DTOs;
using AspNetToolkit.Enums;
using AspNetToolkit.Repos;
using Microsoft.EntityFrameworkCore;

namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Validates whether a Configure resource can be deleted given the PROD-guard rule:
///  1. A resource whose own <see cref="ConfigureEnvironmentType"/> is <c>Prod</c> cannot be deleted.
///  2. A resource (regardless of its own env) that shares the same name with a <c>Prod</c> resource
///     in the same tenant (and space, when applicable) cannot be deleted, to protect the live/published version.
/// Shared by all 8 Configure services so the rule + message stay consistent.
/// </summary>
public static class DeleteResourceGuard
{
    /// <summary>
    /// Checks whether a resource is blocked from deletion because it is a PROD resource, or because a
    /// same-name PROD resource exists in the same tenant/space.
    /// </summary>
    /// <typeparam name="TEntity">The concrete entity type (e.g. <see cref="Entities.Skill"/>).</typeparam>
    /// <param name="repo">The repository for the entity.</param>
    /// <param name="envType">The environment of the resource being deleted.</param>
    /// <param name="name">The name of the resource being deleted (used for messaging and matching).</param>
    /// <param name="prodTwinPredicate">
    /// A predicate that, given the entity type, matches a PROD resource sharing the same name in the same
    /// tenant/space scope. The caller builds it against its concrete entity type.
    /// </param>
    /// <param name="resourceLabel">A user-facing label for the resource type (e.g. "credential", "queue").</param>
    /// <returns>
    /// <c>null</c> when deletion is allowed; otherwise a <see cref="ServiceResponse{bool}"/> indicating the block reason.
    /// </returns>
    public static async Task<ServiceResponse<bool>?> ValidateAsync<TEntity>(
        IRepositoryBase<TEntity, WorkspaceDbContext> repo,
        ConfigureEnvironmentType envType,
        string name,
        Expression<Func<TEntity, bool>> prodTwinPredicate,
        string resourceLabel)
        where TEntity : class
    {
        // Rule 1: A resource that itself lives in PROD cannot be deleted.
        if (envType == ConfigureEnvironmentType.Prod)
        {
            return ServiceResponse<bool>.Create(
                $"Cannot delete {resourceLabel} '{name}' because it is a published (PROD) resource.",
                400,
                false);
        }

        // Rule 2: Block deletion if a same-name PROD resource exists in the same tenant/space scope.
        var hasProdTwin = await repo
            .GetByConditionAsync(prodTwinPredicate)
            .AnyAsync();

        if (hasProdTwin)
        {
            return ServiceResponse<bool>.Create(
                $"Cannot delete {resourceLabel} '{name}' because a published (PROD) version with the same name exists.",
                400,
                false);
        }

        return null;
    }
}
