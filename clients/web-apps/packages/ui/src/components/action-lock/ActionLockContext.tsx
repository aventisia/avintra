import React, { createContext, useContext } from "react";

/** Default tooltip text shown when create/delete actions are locked. */
export const ACTION_LOCK_REASON = "Not available in PROD mode";

type ActionLockState = {
  /** When true, create and delete actions are disabled (e.g. in the Prod environment). */
  locked: boolean;
  /** Tooltip text explaining why actions are locked. */
  reason: string;
};

const DEFAULT_ACTION_LOCK_STATE: ActionLockState = {
  locked: false,
  reason: ACTION_LOCK_REASON,
};

const ActionLockContext = createContext<ActionLockState>(DEFAULT_ACTION_LOCK_STATE);

type ActionLockProviderProps = React.PropsWithChildren<{
  locked: boolean;
  reason?: string;
}>;

/**
 * Provides an environment-driven lock for create/delete actions. The rule (e.g.
 * "locked in Prod") is supplied by the consuming app; this package stays free of
 * environment semantics.
 */
export const ActionLockProvider = ({ locked, reason, children }: ActionLockProviderProps) => (
  <ActionLockContext.Provider value={{ locked, reason: reason ?? ACTION_LOCK_REASON }}>
    {children}
  </ActionLockContext.Provider>
);

/** Reads the surrounding action-lock state. Defaults to unlocked outside a provider. */
// eslint-disable-next-line react-refresh/only-export-components
export const useActionLock = () => useContext(ActionLockContext);
