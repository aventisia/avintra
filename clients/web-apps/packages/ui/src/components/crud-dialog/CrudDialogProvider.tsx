import { useCallback, useEffect } from "react";
import { useBlocker } from "react-router-dom";

import { useShowAlertHandler } from "@/ui/hooks";
import { type CrudEntityKey, type DialogCrudAction } from "@/ui/types";

import { CrudDialogFormContextProvider, useCrudDialogIsDirty } from "./CrudDialogContext";
import { useCrudDialogUrlState } from "./useCrudDialogUrlState";

export interface CrudCustomDialogProps {
  isOpen: boolean;
  crudAction: DialogCrudAction;
  rowId: string;
  /** Closes the dialog, asking first when the form has unsaved changes. */
  onClose: () => void;
  /** Returns to the dialog this one was opened from; set only when there is one. */
  onGoBack?: () => void;
  /** Banner to show above the dialog body, such as an environment warning. */
  banner?: React.ReactNode;
}

export interface CrudDialogEntityConfig {
  /** Renders the whole dialog. */
  Dialog: React.FC<CrudCustomDialogProps>;
}

export type CrudDialogRegistry = Partial<Record<CrudEntityKey, CrudDialogEntityConfig>>;

export interface CrudDialogProviderProps {
  /** Registry mapping entity key to its dialog configuration. */
  registry: CrudDialogRegistry;
  /** Optional banner rendered above the dialog content. */
  contentBanner?: React.ReactNode;
}

/**
 * A single, URL-driven CRUD dialog surface.
 *
 * Reads entity, action, row id and an optional back state from URL query params:
 * - `e`: entity key
 * - `ca`: create | view | edit
 * - `rid`: record id
 * - `back`: encoded previous URL state
 *
 * Wraps the rendered content in a dirty-form guard context. When a mounted form
 * reports it is dirty, attempts to close the dialog or go back will show an
 * "unsaved changes" alert.
 */
export function CrudDialogProvider({ registry, contentBanner }: CrudDialogProviderProps) {
  const { isDialogOpen, entity, crudAction, rowId, back, closeCrudDialog, goBack } =
    useCrudDialogUrlState();

  if (!entity || !crudAction || !rowId) return null;

  const config = registry[entity];
  if (!config) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[CrudDialogProvider] Unknown entity "${entity}". No config found in registry.`);
    }
    return null;
  }

  return (
    <CrudDialogFormContextProvider onClose={closeCrudDialog}>
      <CrudDialog
        isDialogOpen={isDialogOpen}
        crudAction={crudAction}
        rowId={rowId}
        back={back}
        config={config}
        contentBanner={contentBanner}
        onClose={closeCrudDialog}
        onGoBack={goBack}
      />
    </CrudDialogFormContextProvider>
  );
}

interface CrudDialogProps {
  isDialogOpen: boolean;
  crudAction: DialogCrudAction;
  rowId: string;
  back: string | null;
  config: CrudDialogEntityConfig;
  contentBanner?: React.ReactNode;
  onClose: () => void;
  onGoBack: () => void;
}

function CrudDialog({
  isDialogOpen,
  crudAction,
  rowId,
  back,
  config,
  contentBanner,
  onClose,
  onGoBack,
}: CrudDialogProps) {
  const isDirty = useCrudDialogIsDirty();
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Block in-app navigation when the dialog is open and the form is dirty.
  // Only block pathname changes; search-param-only navigation (used by the
  // dialog itself to clean e/ca/rid) must be allowed to proceed.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDialogOpen && isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      showDefaultAlertDialog({
        confirmActionFn: () => {
          blocker.proceed();
        },
        alertType: "unsaved",
      });
    }
  }, [blocker, showDefaultAlertDialog]);

  // Warn users before closing or refreshing the browser/app while dirty.
  useEffect(() => {
    if (!isDialogOpen || !isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Modern browsers require returnValue to be set to a non-empty string.
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDialogOpen, isDirty]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) return;

      if (isDirty) {
        showDefaultAlertDialog({
          confirmActionFn: onClose,
          alertType: "unsaved",
        });
      } else {
        onClose();
      }
    },
    [isDirty, onClose, showDefaultAlertDialog],
  );

  const handleGoBack = useCallback(() => {
    if (isDirty) {
      showDefaultAlertDialog({
        confirmActionFn: onGoBack,
        alertType: "unsaved",
      });
    } else {
      onGoBack();
    }
  }, [isDirty, onGoBack, showDefaultAlertDialog]);

  return (
    <config.Dialog
      isOpen={isDialogOpen}
      crudAction={crudAction}
      rowId={rowId}
      onClose={() => handleOpenChange(false)}
      onGoBack={back ? handleGoBack : undefined}
      banner={contentBanner}
    />
  );
}
