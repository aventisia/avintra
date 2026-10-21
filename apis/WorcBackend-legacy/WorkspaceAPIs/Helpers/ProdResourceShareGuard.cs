namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Blocks share mutations for Configure resources that are persisted in the PROD
/// environment, matching the Configure UI rule that sharing is disabled in PROD.
/// IMPORTANT NOTE: The resource's persisted environment is used (not the request
/// <c>X-Env-Type</c>) so a spoofed header cannot bypass the rule.
/// Only environment-scoped Configure types are checked; Flow, FlowVersion and
/// Space are environment-agnostic and pass through unchanged.
/// </summary>
public static class ProdResourceShareGuard
{
    /// <summary>
    /// Returns a blocked <see cref="ServiceResponse{T}"/> when the target resource is a
    /// PROD Configure resource; otherwise <c>null</c> so the caller can proceed.
    /// </summary>
    /// <typeparam name="T">The service response payload type of the calling method.</typeparam>
    /// <param name="unitOfWork">Unit of work used to resolve the resource's persisted environment.</param>
    /// <param name="resourceType">The share target's resource type.</param>
    /// <param name="resourceId">The share target's identifier.</param>
    /// <param name="operation">The blocked operation phrase (e.g. "share" or "remove access from").</param>
    public static async Task<ServiceResponse<T>?> ValidateAsync<T>(
        IUnitOfWork unitOfWork,
        ResourceTypeEnum resourceType,
        Guid resourceId,
        string operation)
    {
        var (isConfigureResource, isProd, label) =
            await ResolveAsync(unitOfWork, resourceType, resourceId);

        if (isConfigureResource && isProd)
        {
            return ServiceResponse<T>.Create($"Cannot {operation} a published (PROD) {label}.", 400);
        }

        return null;
    }

    /// <summary>
    /// Checks a set of share targets with at most one query per environment-scoped resource type.
    /// </summary>
    public static async Task<ServiceResponse<T>?> ValidateManyAsync<T>(
        IUnitOfWork unitOfWork,
        IEnumerable<(ResourceTypeEnum ResourceType, Guid ResourceId)> resources,
        string operation)
    {
        foreach (var resourceGroup in resources
                     .Distinct()
                     .GroupBy(resource => resource.ResourceType))
        {
            var resourceIds = resourceGroup.Select(resource => resource.ResourceId).Distinct().ToList();
            if (await HasAnyProdAsync(unitOfWork, resourceGroup.Key, resourceIds))
            {
                return ServiceResponse<T>.Create(
                    $"Cannot {operation} a published (PROD) {GetLabel(resourceGroup.Key)}.",
                    400);
            }
        }

        return null;
    }

    private static async Task<bool> HasAnyProdAsync(
        IUnitOfWork unitOfWork,
        ResourceTypeEnum resourceType,
        List<Guid> resourceIds)
    {
        return resourceType switch
        {
            ResourceTypeEnum.Queue => await unitOfWork.QueueRepo.GetByConditionAsync(w =>
                resourceIds.Contains(w.Id) && w.EnvType == ConfigureEnvironmentType.Prod).AnyAsync(),
            ResourceTypeEnum.Trigger => await unitOfWork.TriggerRepo.GetByConditionAsync(w =>
                resourceIds.Contains(w.Id) && w.EnvType == ConfigureEnvironmentType.Prod).AnyAsync(),
            ResourceTypeEnum.ConfigStore => await unitOfWork.ConfigStoreRepo.GetByConditionAsync(w =>
                resourceIds.Contains(w.Id) && w.EnvType == ConfigureEnvironmentType.Prod).AnyAsync(),
            ResourceTypeEnum.VaultCredential => await unitOfWork.VaultCredentialRepo.GetByConditionAsync(w =>
                resourceIds.Contains(w.Id) && w.EnvType == ConfigureEnvironmentType.Prod).AnyAsync(),
            ResourceTypeEnum.KnowledgeBase => await unitOfWork.KnowledgeBaseRepo.GetByConditionAsync(w =>
                resourceIds.Contains(w.Id) && w.EnvType == ConfigureEnvironmentType.Prod).AnyAsync(),
            ResourceTypeEnum.Skill => await unitOfWork.SkillRepo.GetByConditionAsync(w =>
                resourceIds.Contains(w.Id) && w.EnvType == ConfigureEnvironmentType.Prod).AnyAsync(),
            ResourceTypeEnum.Tool => await unitOfWork.ToolRepo.GetByConditionAsync(w =>
                resourceIds.Contains(w.Id) && w.EnvType == ConfigureEnvironmentType.Prod).AnyAsync(),
            _ => false
        };
    }

    private static string GetLabel(ResourceTypeEnum resourceType) => resourceType switch
    {
        ResourceTypeEnum.Queue => "queue",
        ResourceTypeEnum.Trigger => "trigger",
        ResourceTypeEnum.ConfigStore => "key store",
        ResourceTypeEnum.VaultCredential => "credential",
        ResourceTypeEnum.KnowledgeBase => "knowledge base",
        ResourceTypeEnum.Skill => "skill",
        ResourceTypeEnum.Tool => "tool",
        _ => string.Empty
    };

    // Resolves whether the target is a Configure resource and whether it is persisted in PROD.
    private static async Task<(bool IsConfigureResource, bool IsProd, string Label)> ResolveAsync(
        IUnitOfWork unitOfWork,
        ResourceTypeEnum resourceType,
        Guid resourceId)
    {
        // Keep environment-scoped resource cases aligned with WorkspaceCrudDialogProvider.CONFIG_ENTITY_KEYS.
        switch (resourceType)
        {
            case ResourceTypeEnum.Queue:
                return (true, await IsProdAsync(unitOfWork.QueueRepo, w => w.Id == resourceId, e => e.EnvType), "queue");
            case ResourceTypeEnum.Trigger:
                return (true, await IsProdAsync(unitOfWork.TriggerRepo, w => w.Id == resourceId, e => e.EnvType), "trigger");
            case ResourceTypeEnum.ConfigStore:
                return (true, await IsProdAsync(unitOfWork.ConfigStoreRepo, w => w.Id == resourceId, e => e.EnvType), "key store");
            case ResourceTypeEnum.VaultCredential:
                return (true, await IsProdAsync(unitOfWork.VaultCredentialRepo, w => w.Id == resourceId, e => e.EnvType), "credential");
            case ResourceTypeEnum.KnowledgeBase:
                return (true, await IsProdAsync(unitOfWork.KnowledgeBaseRepo, w => w.Id == resourceId, e => e.EnvType), "knowledge base");
            case ResourceTypeEnum.Skill:
                return (true, await IsProdAsync(unitOfWork.SkillRepo, w => w.Id == resourceId, e => e.EnvType), "skill");
            case ResourceTypeEnum.Tool:
                return (true, await IsProdAsync(unitOfWork.ToolRepo, w => w.Id == resourceId, e => e.EnvType), "tool");
            default:
                // Flow, FlowVersion and Space are not environment-scoped.
                return (false, false, string.Empty);
        }
    }

    // Reads the persisted environment of a single resource without tracking it.
    private static async Task<bool> IsProdAsync<TEntity>(
        IRepositoryBase<TEntity, WorkspaceDbContext> repo,
        Expression<Func<TEntity, bool>> predicate,
        Expression<Func<TEntity, ConfigureEnvironmentType>> envSelector)
        where TEntity : class
    {
        var envType = await repo
            .GetByConditionAsync(predicate)
            .Select(envSelector)
            .Select(env => (ConfigureEnvironmentType?)env)
            .FirstOrDefaultAsync();

        return envType == ConfigureEnvironmentType.Prod;
    }
}
