/**
 * Builds a predicate that reports whether a studio provider value has at least one enabled model.
 */
export const createHasEnabledModels =
  (enabledModelIdsByProvider: Record<string, string[]>) =>
  (providerValue: string): boolean =>
    (enabledModelIdsByProvider[providerValue]?.length ?? 0) > 0;
