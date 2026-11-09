import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { AssignMachineDto } from "../dtos/assign-machine-dto";
import { useAssignMachineStore } from "../stores/assign-machine-store";
import { useAssignMachineMutation } from "./useAssignMachineMutation";
import { useFetchMachines } from "./useFetchMachines";

export type MachineChange = "added" | "kept" | "removed";

/**
 * Editable draft of the machines assigned to the agent version in the assign machine store.
 * Edits stay local until `save` sends the complete set, matching the bulk-replace API.
 */
export const useMachineAssignmentDraft = () => {
  const { flowVersionId, flowName, setShowDialog } = useAssignMachineStore(
    useShallow((state) => ({
      flowVersionId: state.flowVersionId,
      flowName: state.flowName,
      setShowDialog: state.setShowDialog,
    })),
  );

  const { data, isLoading } = useFetchMachines(flowVersionId);
  const { mutateAsync: assignMachines, isPending: isSaving } = useAssignMachineMutation();

  const saved = useMemo(() => (data?.data ?? []).filter((machine) => machine.isAssigned), [data]);
  const savedIds = useMemo(() => saved.map((machine) => machine.id), [saved]);

  const [draftIds, setDraftIds] = useState<string[] | null>(null);
  const [picked, setPicked] = useState<Record<string, AssignMachineDto>>({});

  const selectedIds = draftIds ?? savedIds;

  const { selectedSet, rows, addedCount, removedCount } = useMemo(() => {
    const savedLookup = new Set(savedIds);
    const selectedLookup = new Set(selectedIds);
    const added = selectedIds
      .filter((id) => !savedLookup.has(id))
      .map((id) => picked[id])
      .reverse();

    return {
      selectedSet: selectedLookup,
      addedCount: added.length,
      removedCount: savedIds.filter((id) => !selectedLookup.has(id)).length,
      rows: [
        ...added.map((machine) => ({ machine, change: "added" as MachineChange })),
        ...saved.map((machine) => ({
          machine,
          change: (selectedLookup.has(machine.id) ? "kept" : "removed") as MachineChange,
        })),
      ],
    };
  }, [picked, saved, savedIds, selectedIds]);

  const isDirty = addedCount > 0 || removedCount > 0;

  const updateDraft = (update: (ids: string[]) => string[]) =>
    setDraftIds((prev) => update(prev ?? savedIds));

  const add = (machine: AssignMachineDto) => {
    setPicked((prev) => ({ ...prev, [machine.id]: machine }));
    updateDraft((ids) => (ids.includes(machine.id) ? ids : [...ids, machine.id]));
  };

  const remove = (machineId: string) => updateDraft((ids) => ids.filter((id) => id !== machineId));

  const save = async () => {
    if (!isDirty || isSaving) return;
    try {
      await assignMachines({ flowVersionId, machineIds: selectedIds });
      setShowDialog(false);
    } catch {
      return;
    }
  };

  return {
    flowName,
    isLoading: isLoading && !data,
    isSaving,
    rows,
    selectedIds,
    addedCount,
    removedCount,
    isDirty,
    isSelected: (machineId: string) => selectedSet.has(machineId),
    add,
    remove,
    toggle: (machine: AssignMachineDto) =>
      selectedSet.has(machine.id) ? remove(machine.id) : add(machine),
    removeAll: () => setDraftIds([]),
    save,
    close: () => setShowDialog(false),
  };
};

export type MachineAssignmentDraft = ReturnType<typeof useMachineAssignmentDraft>;
