import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowLeftIcon } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useBlocker } from "react-router-dom";

import { Button } from "@/ui/components/buttons";
import { DialogContent, DialogDefaultHeader } from "@/ui/components/dialog";
import { ScrollArea } from "@/ui/components/scroll";
import { useShowAlertHandler } from "@/ui/hooks";
import { type CrudEntityKey, type DialogCrudAction } from "@/ui/types";

import { CrudDialogFormContextProvider, useCrudDialogIsDirty } from "./CrudDialogContext";
import { useCrudDialogUrlState } from "./useCrudDialogUrlState";

export interface CrudDialogEntityConfig {
  /** Tailwind class controlling the dialog max-width, e.g. "!max-w-[36rem]". */
  maxWidth: string;
  /** Returns the dialog heading/description for the current action. */
  getHeader: (crudAction: DialogCrudAction) => { heading: string; description?: string };
  /** Component that renders the dialog body. */
  Content: React.FC<{
    crudAction: DialogCrudAction;
    rowId: string;
  }>;
}

export type CrudDialogRegistry = Record<CrudEntityKey, CrudDialogEntityConfig>;

export interface CrudDialogProviderProps {
  /** Registry mapping entity key to its dialog configuration. */
  registry: CrudDialogRegistry;
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
export function CrudDialogProvider({ registry }: CrudDialogProviderProps) {
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
  onClose: () => void;
  onGoBack: () => void;
}

function CrudDialog({
  isDialogOpen,
  crudAction,
  rowId,
  back,
  config,
  onClose,
  onGoBack,
}: CrudDialogProps) {
  const isDirty = useCrudDialogIsDirty();
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Block in-app navigation when the dialog is open and the form is dirty.
  const blocker = useBlocker(() => isDialogOpen && isDirty);

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

  const { maxWidth, getHeader, Content } = config;
  const { heading, description } = getHeader(crudAction);

  return (
    <DialogPrimitive.Root open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent side="right" className={maxWidth}>
        <DialogDefaultHeader
          heading={heading}
          description={description}
          className="border-b p-3.5 text-lg tracking-wide"
        >
          {back ? (
            <Button variant="ghost" size="icon8" onClick={handleGoBack} aria-label="Go back">
              <ArrowLeftIcon className="h-5 w-5 text-[--icon-color]" />
              <span className="sr-only">Back</span>
            </Button>
          ) : null}
        </DialogDefaultHeader>
        <ScrollArea className="h-[calc(100vh-4rem)] px-2.5 pb-0 pt-4">
          <Content crudAction={crudAction} rowId={rowId} />
        </ScrollArea>
      </DialogContent>
    </DialogPrimitive.Root>
  );
}
