import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface CrudDialogContextValue {
  /** True when the currently mounted CRUD form has unsaved changes. */
  isDirty: boolean;
  /** Lets the current form tell the provider whether it is dirty. */
  setIsDirty: (isDirty: boolean) => void;
  /** Called by the provider when the user attempts to close/navigate away. */
  onCloseConfirmed: () => void;
}

const CrudDialogContext = createContext<CrudDialogContextValue | null>(null);

interface CrudDialogChromeValue {
  /** Live `name` of the record in the mounted form, shown as the dialog title. */
  recordName: string | undefined;
  setRecordName: (name: string | undefined) => void;
  /** True while a read-only record view (not a form) is mounted. */
  isRecordView: boolean;
  setIsRecordView: (isRecordView: boolean) => void;
  /** Footer element that `CrudDialogActions` portals into. */
  actionsSlot: HTMLElement | null;
  setActionsSlot: (element: HTMLElement | null) => void;
}

const CrudDialogChromeContext = createContext<CrudDialogChromeValue | null>(null);

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
  const [recordName, setRecordName] = useState<string>();
  const [isRecordView, setIsRecordView] = useState(false);
  const [actionsSlot, setActionsSlot] = useState<HTMLElement | null>(null);

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

  const chrome = useMemo(
    () => ({
      recordName,
      setRecordName,
      isRecordView,
      setIsRecordView,
      actionsSlot,
      setActionsSlot,
    }),
    [recordName, isRecordView, actionsSlot],
  );

  return (
    <CrudDialogContext.Provider value={value}>
      <CrudDialogChromeContext.Provider value={chrome}>{children}</CrudDialogChromeContext.Provider>
    </CrudDialogContext.Provider>
  );
}

/**
 * Header title and footer actions slot of the URL-driven CRUD dialog, or null outside one.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useCrudDialogChrome() {
  return useContext(CrudDialogChromeContext);
}

/** Setter for the CRUD dialog title; throws outside a `CrudDialogFormContextProvider`. */
// eslint-disable-next-line react-refresh/only-export-components
export function useCrudDialogRecordNameSetter() {
  const ctx = useContext(CrudDialogChromeContext);

  if (!ctx) {
    throw new Error(
      "useCrudDialogRecordNameSetter must be used inside a CrudDialogFormContextProvider",
    );
  }

  return ctx.setRecordName;
}

/**
 * Marks the mounted content as a read-only record view titled `name`; throws outside a
 * `CrudDialogFormContextProvider`.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useCrudDialogRecordView(name: string | undefined) {
  const ctx = useContext(CrudDialogChromeContext);

  if (!ctx) {
    throw new Error("useCrudDialogRecordView must be used inside a CrudDialogFormContextProvider");
  }

  const { setRecordName, setIsRecordView } = ctx;

  useEffect(() => {
    setIsRecordView(true);
    return () => {
      setIsRecordView(false);
      setRecordName(undefined);
    };
  }, [setIsRecordView, setRecordName]);

  useEffect(() => {
    setRecordName(name);
  }, [name, setRecordName]);
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

/**
 * Returns true when the calling component is mounted inside a URL-driven CRUD
 * dialog. The generic `Form.tsx` blocker defers to the dialog's own blocker so
 * React Router only has one active blocker at a time.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useIsInsideCrudDialog() {
  return useContext(CrudDialogContext) !== null;
}
