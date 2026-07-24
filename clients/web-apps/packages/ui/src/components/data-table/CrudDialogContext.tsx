import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface CrudDialogContextValue {
  /** True when the currently mounted CRUD form has unsaved changes. */
  isDirty: boolean;
  /** Lets the current form tell the provider whether it is dirty. */
  setIsDirty: (isDirty: boolean) => void;
  /** Called by the provider when the user attempts to close/navigate away. */
  onCloseConfirmed: () => void;
}

const CrudDialogContext = createContext<CrudDialogContextValue | null>(null);

interface CrudDialogProviderContextProps {
  children: React.ReactNode;
  onClose: () => void;
}

/**
 * Provides a dirty-form signal surface for URL-driven CRUD dialogs.
 *
 * The parent `CrudDialogProvider` mounts this around each entity's content.
 * Form components call `useCrudDialogDirty()` to report their dirty state and
 * receive a stable close handler.
 */
export function CrudDialogFormContextProvider({
  children,
  onClose,
}: CrudDialogProviderContextProps) {
  const [isDirty, setIsDirtyState] = useState(false);

  const setIsDirty = useCallback((value: boolean) => {
    setIsDirtyState(value);
  }, []);

  const onCloseConfirmed = useCallback(() => {
    setIsDirtyState(false);
    onClose();
  }, [onClose]);

  const value = useMemo(
    () => ({
      isDirty,
      setIsDirty,
      onCloseConfirmed,
    }),
    [isDirty, setIsDirty, onCloseConfirmed],
  );

  return <CrudDialogContext.Provider value={value}>{children}</CrudDialogContext.Provider>;
}

/**
 * Hook for forms inside a URL-driven CRUD dialog to report dirty state.
 *
 * Returns the current dirty flag, a setter, and a function to close the dialog.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useCrudDialogDirty() {
  const ctx = useContext(CrudDialogContext);

  if (!ctx) {
    throw new Error("useCrudDialogDirty must be used inside a CrudDialogFormContextProvider");
  }

  return ctx;
}

/**
 * Hook for the `CrudDialogProvider` (or any parent) to read the current dirty state.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useCrudDialogIsDirty() {
  const ctx = useContext(CrudDialogContext);

  if (!ctx) {
    throw new Error("useCrudDialogIsDirty must be used inside a CrudDialogFormContextProvider");
  }

  return ctx.isDirty;
}
