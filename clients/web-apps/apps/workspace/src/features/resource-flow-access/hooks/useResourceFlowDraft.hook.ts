import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { MAX_RESOURCE_FLOWS } from "../constants/resource-flow-access.constant";
import { useResourceFlowAccessStore } from "../stores/resource-flow-access.store";
import type { FlowAccessAgent, FlowAccessRow } from "../types/flow-access.type";
import { useAssignFlows } from "./useAssignFlows.hook";
import { useGetAssignedFlows } from "./useGetAssignedFlows.hook";

/**
 * Holds an editable draft of the flows assigned to the resource selected in the flow access
 * store. Edits stay local until `save` sends the complete set, matching the bulk-replace API.
 */
export const useResourceFlowDraft = (queryKey: unknown[]) => {
  const { resourceType, resourceId, resourceName, isRestricted, setShowDialog } =
    useResourceFlowAccessStore(
      useShallow((state) => ({
        resourceType: state.resourceType,
        resourceId: state.resourceId,
        resourceName: state.resourceName,
        isRestricted: state.isRestricted,
        setShowDialog: state.setShowDialog,
      })),
    );

  const { data, isLoading } = useGetAssignedFlows(resourceType, resourceId);
  const { mutateAsync: assignFlows, isPending: isSaving } = useAssignFlows(queryKey);

  const saved = useMemo<FlowAccessAgent[]>(() => data?.data ?? [], [data]);
  const savedIds = useMemo(() => saved.map((agent) => agent.id), [saved]);

  const [draftIds, setDraftIds] = useState<string[] | null>(null);
  const [pickedAgentDetails, setPickedAgentDetails] = useState<Record<string, FlowAccessAgent>>({});

  const selectedIds = draftIds ?? savedIds;

  const { selectedSet, rows, added, removed } = useMemo(() => {
    const savedLookup = new Set(savedIds);
    const selectedLookup = new Set(selectedIds);
    const addedAgents = selectedIds
      .filter((id) => !savedLookup.has(id))
      .map((id) => pickedAgentDetails[id] ?? { id, name: id })
      .reverse();

    return {
      selectedSet: selectedLookup,
      added: addedAgents,
      removed: saved.filter((agent) => !selectedLookup.has(agent.id)),
      rows: [
        ...addedAgents.map((agent): FlowAccessRow => ({ agent, change: "added" })),
        ...saved.map((agent): FlowAccessRow => ({
          agent,
          change: selectedLookup.has(agent.id) ? "kept" : "removed",
        })),
      ],
    };
  }, [pickedAgentDetails, saved, savedIds, selectedIds]);

  const isDirty = added.length > 0 || removed.length > 0;

  const wasRestrictedEmpty = isRestricted && saved.length === 0;

  const updateDraft = (update: (ids: string[]) => string[]) =>
    setDraftIds((prev) => update(prev ?? savedIds));

  const add = (agent: FlowAccessAgent) => {
    setPickedAgentDetails((prev) => ({ ...prev, [agent.id]: { ...prev[agent.id], ...agent } }));
    updateDraft((ids) =>
      ids.includes(agent.id) || ids.length >= MAX_RESOURCE_FLOWS ? ids : [...ids, agent.id],
    );
  };

  const remove = (agentId: string) => updateDraft((ids) => ids.filter((id) => id !== agentId));

  const toggle = (agent: FlowAccessAgent) =>
    selectedSet.has(agent.id) ? remove(agent.id) : add(agent);

  const save = async () => {
    if (!resourceType || !resourceId || (!isDirty && !wasRestrictedEmpty) || isSaving) return;
    try {
      await assignFlows({
        resourceType,
        resourceId,
        flowIds: selectedIds,
      });
      setShowDialog(false);
    } catch {
      return;
    }
  };

  return {
    resourceType,
    resourceName,
    isLoading: isLoading && !data,
    isSaving,
    saved,
    rows,
    added,
    removed,
    selectedIds,
    isDirty,
    isOpenAccess: selectedIds.length === 0,
    wasOpenAccess: saved.length === 0 && !isRestricted,
    wasRestrictedEmpty,
    isAtLimit: selectedIds.length >= MAX_RESOURCE_FLOWS,
    isSelected: (agentId: string) => selectedSet.has(agentId),
    add,
    remove,
    toggle,
    replace: (ids: string[]) => setDraftIds(ids),
    save,
    close: () => setShowDialog(false),
  };
};

export type ResourceFlowDraft = ReturnType<typeof useResourceFlowDraft>;
