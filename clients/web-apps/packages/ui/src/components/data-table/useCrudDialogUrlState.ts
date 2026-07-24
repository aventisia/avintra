import { useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";

import { type CrudEntityKey, type DialogCrudAction } from "@/ui/types";

const DIALOG_PARAM_KEYS = ["e", "ca", "rid", "back"];

const crudActionParamMapper: Record<string, DialogCrudAction> = {
  create: "create",
  view: "read",
  edit: "update",
};

const crudActionReverseMapper: Record<DialogCrudAction, string> = {
  create: "create",
  read: "view",
  update: "edit",
};

export interface CrudDialogState {
  entity: CrudEntityKey | null;
  crudAction: DialogCrudAction | null;
  rowId: string | null;
  back: string | null;
  isDialogOpen: boolean;
}

export interface OpenCrudDialogOptions {
  /** Entity identifier, e.g. "machine" or "job" */
  entity: CrudEntityKey;
  /** CRUD action */
  crudAction: DialogCrudAction;
  /** Record id. For create flows use a fresh UUID or any stable placeholder. */
  rowId: string;
  /** Optional encoded return state to restore when this dialog completes. */
  back?: string;
  /** Additional query params to set alongside the dialog params. */
  extraParams?: Record<string, string>;
}

/**
 * Hook to read and manipulate the URL-driven CRUD dialog state.
 *
 * Query params used:
 * - `e`: entity name (e.g. "machine", "job")
 * - `ca`: crud action short code ("create", "view", "edit")
 * - `rid`: record id
 * - `back`: URL-encoded return state string
 *
 * Extra params registered via `extraParams` are tracked so they can be cleaned
 * up when the dialog closes or navigates back.
 */
export function useCrudDialogUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Keep track of extra params added by openCrudDialog so we can remove them
  // when the dialog is closed or the user goes back.
  const extraParamKeysRef = useRef<string[]>([]);

  const entityParam = searchParams.get("e") as CrudEntityKey | null;
  const crudActionParam = searchParams.get("ca");
  const rowIdParam = searchParams.get("rid");
  const backParam = searchParams.get("back");

  const crudAction = crudActionParam ? (crudActionParamMapper[crudActionParam] ?? null) : null;
  const isDialogOpen = Boolean(entityParam && crudAction);

  const openCrudDialog = useCallback(
    ({ entity, crudAction: action, rowId, back, extraParams }: OpenCrudDialogOptions) => {
      setSearchParams(
        (params) => {
          params.set("e", entity);
          params.set("ca", crudActionReverseMapper[action]);
          params.set("rid", rowId);

          if (back) {
            params.set("back", back);
          } else {
            params.delete("back");
          }

          // Record extra keys so they can be cleaned later.
          extraParamKeysRef.current = extraParams ? Object.keys(extraParams) : [];

          if (extraParams) {
            Object.entries(extraParams).forEach(([key, value]) => {
              params.set(key, value);
            });
          }

          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const cleanupDialogParams = useCallback(
    (params: URLSearchParams) => {
      DIALOG_PARAM_KEYS.forEach((key) => params.delete(key));
      extraParamKeysRef.current.forEach((key) => params.delete(key));
      extraParamKeysRef.current = [];
      return params;
    },
    [extraParamKeysRef],
  );

  const closeCrudDialog = useCallback(() => {
    setSearchParams(
      (params) => {
        return cleanupDialogParams(params);
      },
      { replace: true },
    );
  }, [cleanupDialogParams, setSearchParams]);

  const goBack = useCallback(() => {
    if (!backParam) {
      closeCrudDialog();
      return;
    }

    const decoded = new URLSearchParams(backParam);
    setSearchParams(
      (params) => {
        // Start from current params so filters/pagination/tabs are preserved,
        // then remove dialog params and merge the back snapshot on top.
        const next = new URLSearchParams(params);
        cleanupDialogParams(next);
        decoded.forEach((value, key) => next.set(key, value));
        return next;
      },
      { replace: true },
    );
  }, [backParam, cleanupDialogParams, closeCrudDialog, setSearchParams]);

  return useMemo(
    () => ({
      entity: entityParam,
      crudAction,
      rowId: rowIdParam,
      back: backParam,
      isDialogOpen,
      openCrudDialog,
      closeCrudDialog,
      goBack,
    }),
    [
      entityParam,
      crudAction,
      rowIdParam,
      backParam,
      isDialogOpen,
      openCrudDialog,
      closeCrudDialog,
      goBack,
    ],
  );
}
