import { toast } from "@avplatform/ui/sonner";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import {
  deleteResourceShare,
  getResourceShareById,
  insertResourceShare,
  updateResourceShare,
  updateTenantWideAccess,
} from "../apis/resource-share-apis";
import { RESOURCE_USER_KEY } from "../constants/resource-share.constant";
import { DEFAULT_SHARE_ROLE } from "../constants/share-roles.constant";
import { ResourceAccessTypeEnum } from "../enums/resource-access-type-enum";
import { ResourceTypeEnum } from "../enums/resource-type-enum";
import { useResourceShareStore } from "../stores/resource-share-store";
import { AccessMode } from "../types/flow-access.type";
import { ShareInvite, SharePerson, ShareRow } from "../types/share-draft.type";
import { getHttpErrorMessage } from "../utils/http-error.util";
import { getShareDraftChanges } from "../utils/share-draft.util";

/**
 * Editable draft of who can use the resource selected in the resource share store. Nothing is
 * sent until `save`, which applies the access mode, removals, role changes and new people
 * together, then refreshes the page list under `queryKey`.
 */
export const useResourceShareDraft = (isOpen: boolean, queryKey: unknown[]) => {
  const queryClient = useQueryClient();
  const { resourceId, resourceName, resourceType, isTenantWideAccess, setShowDialog } =
    useResourceShareStore(
      useShallow((state) => ({
        resourceId: state.resourceId,
        resourceName: state.resourceName,
        resourceType: state.resourceType,
        isTenantWideAccess: state.isTenantWideAccess,
        setShowDialog: state.setShowDialog,
      })),
    );
  const myEmail = useUserSessionStore((state) => state.userSession?.email?.toLowerCase() ?? "");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [RESOURCE_USER_KEY, resourceId],
    queryFn: () => getResourceShareById(resourceId ?? ""),
    enabled: isOpen && Boolean(resourceId),
    staleTime: 0,
  });
  const saved = useMemo(() => data?.data ?? [], [data]);

  const isSpace = resourceType === ResourceTypeEnum.Space;
  const [savedTenantWide, setSavedTenantWide] = useState(isTenantWideAccess && !isSpace);
  const [mode, setMode] = useState<AccessMode>(savedTenantWide ? "open" : "restricted");
  const [invites, setInvites] = useState<ShareInvite[]>([]);
  const [roleEdits, setRoleEdits] = useState<Record<string, ResourceAccessTypeEnum>>({});
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { added, edited, removed, rows } = useMemo(
    () => getShareDraftChanges({ saved, invites, roleEdits, removedIds, myEmail }),
    [invites, myEmail, removedIds, roleEdits, saved],
  );
  const savedByUserId = useMemo(
    () => new Map(saved.map((share) => [share.userId, share])),
    [saved],
  );

  const isOpenAccess = mode === "open";
  const isModeChanged = isOpenAccess !== savedTenantWide;
  const hasPeopleChanges = added.length + edited.length + removed.length > 0;
  const isDirty = isModeChanged || (!isOpenAccess && hasPeopleChanges);
  const isPending = isLoading && !data;

  const editDraft = (apply: () => void) => {
    if (isSaving) return;
    setSaveError(null);
    apply();
  };

  const getPickState = (userId: string) => {
    const share = savedByUserId.get(userId);
    if (share) return removedIds.includes(share.id) ? "none" : "shared";
    return invites.some(({ person }) => person.userId === userId) ? "invited" : "none";
  };

  const togglePerson = (person: SharePerson) =>
    editDraft(() => {
      const share = savedByUserId.get(person.userId);
      if (share) {
        setRemovedIds((ids) => ids.filter((id) => id !== share.id));
        return;
      }
      setInvites((current) =>
        current.some((invite) => invite.person.userId === person.userId)
          ? current.filter((invite) => invite.person.userId !== person.userId)
          : [...current, { person, role: DEFAULT_SHARE_ROLE }],
      );
    });

  const setRole = (row: ShareRow, role: ResourceAccessTypeEnum) =>
    editDraft(() => {
      const share = row.share;
      if (share) {
        setRoleEdits((edits) => ({ ...edits, [share.id]: role }));
        return;
      }
      setInvites((current) =>
        current.map((invite) =>
          invite.person.userId === row.person.userId ? { ...invite, role } : invite,
        ),
      );
    });

  const removeRow = (row: ShareRow) =>
    editDraft(() => {
      const share = row.share;
      if (share) {
        setRemovedIds((ids) => [...ids, share.id]);
        return;
      }
      setInvites((current) =>
        current.filter((invite) => invite.person.userId !== row.person.userId),
      );
    });

  const restoreRow = (row: ShareRow) =>
    editDraft(() => setRemovedIds((ids) => ids.filter((id) => id !== row.share?.id)));

  const chooseMode = (next: AccessMode) => editDraft(() => setMode(next));

  const save = async () => {
    if (!resourceId || !resourceType || !isDirty || isSaving) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      const requests: Promise<unknown>[] = [];
      if (isModeChanged) {
        requests.push(
          updateTenantWideAccess({
            resourceId,
            resourceType,
            isTenantWideAccess: isOpenAccess,
          }).then(() => setSavedTenantWide(isOpenAccess)),
        );
      }
      if (!isOpenAccess) {
        requests.push(
          ...removed.map((share) => deleteResourceShare(share.id)),
          ...edited.map((share) =>
            updateResourceShare({ ...share, accessLevel: roleEdits[share.id] }),
          ),
        );
        if (added.length > 0) {
          requests.push(
            insertResourceShare({
              resourceType,
              resourceId,
              users: added.map(({ person, role }) => ({
                userId: person.userId,
                accessLevel: role,
              })),
            }),
          );
        }
      }

      const failures = (await Promise.allSettled(requests)).filter(
        (result): result is PromiseRejectedResult => result.status === "rejected",
      );
      void queryClient.invalidateQueries({ queryKey });
      await queryClient.invalidateQueries({ queryKey: [RESOURCE_USER_KEY, resourceId] });

      if (failures.length === 0) {
        toast.success("Sharing updated", { className: "sonner-toaster-sm" });
        setShowDialog(false);
        return;
      }
      const message = getHttpErrorMessage(failures[0].reason, "Couldn’t save the changes");
      setSaveError(
        failures.length === requests.length ? message : `Some changes didn’t save. ${message}`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  return {
    resourceName: resourceName ?? "",
    resourceType,
    canShareWithEveryone: !isSpace,
    hasRoles: !isSpace,
    isOpenAccess,
    isLoading: isPending,
    isError: isError && !data,
    retry: () => void refetch(),
    isSaving,
    saveError,
    rows,
    added,
    edited,
    removed,
    isModeChanged,
    hasPeopleChanges,
    isDirty,
    canSave: isDirty && !isSaving && !isPending && !(isError && !data),
    getPickState,
    togglePerson,
    setRole,
    removeRow,
    restoreRow,
    chooseMode,
    save,
    close: () => setShowDialog(false),
  };
};

export type ResourceShareDraft = ReturnType<typeof useResourceShareDraft>;
