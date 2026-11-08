namespace AccountsAPIs.Helpers;

/// <summary>
/// Subscription plans each deployment edition seeds, and the ones its host tenant and new signups subscribe to.
/// </summary>
public static class EditionSubscriptionPlanHelpers
{
    /// <summary>
    /// Builds the <c>type-frequency-currency</c> unique name shared by every plan of that combination.
    /// </summary>
    public static string BuildUniqueName(SubscriptionPlanTypeEnum type, SubscriptionFrequenciesEnum frequency, CurrencyTypesEnum currency)
    {
        return $"{type}-{frequency}-{currency}".ToLowerInvariant();
    }

    /// <summary>
    /// All plans the running edition seeds, host plan included.
    /// </summary>
    public static List<SubscriptionPlan> GetSeedPlans(EnvironmentConfig environmentConfig, Guid userId)
    {
        return IsCommercialDeployment(environmentConfig)
            ? [CommercialHostPlan(userId), StarterMonthlyPlan(userId), ProMonthlyPlan(userId), ProYearlyPlan(userId)]
            : [GetHostPlan(environmentConfig, userId)];
    }

    /// <summary>
    /// Plan the deployment's host (super user) tenant subscribes to.
    /// </summary>
    public static SubscriptionPlan GetHostPlan(EnvironmentConfig environmentConfig, Guid userId)
    {
        if (environmentConfig.IsCommunityDeployment) return CommunityPlan(userId);

        return IsCommercialDeployment(environmentConfig) ? CommercialHostPlan(userId) : EnterprisePlan(userId);
    }

    /// <summary>
    /// Plan a newly signed-up tenant subscribes to.
    /// </summary>
    public static SubscriptionPlan GetSignupPlan(EnvironmentConfig environmentConfig, Guid userId)
    {
        return IsCommercialDeployment(environmentConfig) ? StarterMonthlyPlan(userId) : GetHostPlan(environmentConfig, userId);
    }

    private static bool IsCommercialDeployment(EnvironmentConfig environmentConfig)
    {
        return !environmentConfig.IsCommunityDeployment &&
            environmentConfig.OnPremTenantType.Equals(OnPremTenantTypesEnum.Commercial.ToString(), StringComparison.InvariantCultureIgnoreCase);
    }

    private static SubscriptionPlan CommunityPlan(Guid userId) =>
        CreatePlan("Community", SubscriptionPlanTypeEnum.None, SubscriptionFrequenciesEnum.Yearly, PlanStatusTypesEnum.Custom, 0, ulong.MaxValue, 0, 0, 1, 1, userId);

    private static SubscriptionPlan EnterprisePlan(Guid userId) =>
        CreatePlan("Enterprise", SubscriptionPlanTypeEnum.Enterprise, SubscriptionFrequenciesEnum.Yearly, PlanStatusTypesEnum.Custom, 0, ulong.MaxValue, 0, 0, 0, 365, userId);

    private static SubscriptionPlan StarterMonthlyPlan(Guid userId) =>
        CreatePlan("Starter", SubscriptionPlanTypeEnum.Starter, SubscriptionFrequenciesEnum.Monthly, PlanStatusTypesEnum.Current, 0, 500, 50, 3, 1, 1, userId);

    private static SubscriptionPlan ProMonthlyPlan(Guid userId) =>
        CreatePlan("Pro", SubscriptionPlanTypeEnum.Pro, SubscriptionFrequenciesEnum.Monthly, PlanStatusTypesEnum.Current, 5700, 30000, 200, 0, 3, 30, userId);

    private static SubscriptionPlan ProYearlyPlan(Guid userId) =>
        CreatePlan("Pro", SubscriptionPlanTypeEnum.Pro, SubscriptionFrequenciesEnum.Yearly, PlanStatusTypesEnum.Current, 54720, 360000, 200, 0, 3, 30, userId);

    private static SubscriptionPlan CommercialHostPlan(Guid userId)
    {
        var plan = CreatePlan("Default", SubscriptionPlanTypeEnum.Pro, SubscriptionFrequenciesEnum.Yearly, PlanStatusTypesEnum.Custom, 0, ulong.MaxValue, 0, 0, 0, int.MaxValue, userId);

        // IMPORTANT NOTE: shares type, frequency and currency with the purchasable Pro yearly plan, so the prefix keeps its unique name distinct.
        plan.UniqueName = $"default-{plan.UniqueName}";
        return plan;
    }

    private static SubscriptionPlan CreatePlan(string name, SubscriptionPlanTypeEnum type, SubscriptionFrequenciesEnum frequency, PlanStatusTypesEnum status, decimal price, ulong maxCredits, int storageLimitMB, int maxUsers, int maxSpaces, int historyRetentionDays, Guid userId)
    {
        return new SubscriptionPlan
        {
            Name = name,
            Type = type,
            Frequency = frequency,
            Currency = CurrencyTypesEnum.INR,
            UniqueName = BuildUniqueName(type, frequency, CurrencyTypesEnum.INR),
            Price = price,
            MaxCredits = maxCredits,
            MaxPublishedItems = 0,
            MaxSpaces = maxSpaces,
            StorageLimitMB = storageLimitMB,
            MaxUsers = maxUsers,
            HistoryRetentionDays = historyRetentionDays,
            Status = status,
            IsDefault = true,
            IncludeTax = false,
            CreatedByUserId = userId,
            LastModifiedByUserId = userId
        };
    }
}
