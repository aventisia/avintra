import { type ReactNode, createContext, useContext } from "react";

export type VaultCredentialScope = "space" | "tenant";

const VaultCredentialScopeContext = createContext<VaultCredentialScope>("space");

/**
 * Selects whether the vault credential components work on space-level or tenant-level credentials.
 */
export const VaultCredentialScopeProvider = ({
  scope,
  children,
}: {
  scope: VaultCredentialScope;
  children: ReactNode;
}) => (
  <VaultCredentialScopeContext.Provider value={scope}>
    {children}
  </VaultCredentialScopeContext.Provider>
);

export const useVaultCredentialScope = () => useContext(VaultCredentialScopeContext);
