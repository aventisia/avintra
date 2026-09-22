import { toast } from "@avplatform/ui/sonner";
import { FieldValues, UseFormReturn } from "react-hook-form";

import { NodeInputType, NodeOutputType } from "@/types/node-data-type";

import { useDynamicConfigPanelStore } from "../stores/dcp-store";
import { refineSubmittedIO } from "../utils/refine-submitted-io";
import { useUpdateNodeDataIO } from "./useUpdateNodeDataIO";

/**
 * Imperative commit registered in the DCP store by the active config form.
 * Async because committing composite fields may be async. Returns void.
 */
export type FlushFormFn = () => void | Promise<void>;

type FlushExtras = {
  selectAgent?: { [key: string]: string } | null;
  selectBlock?: { [key: string]: string } | null;
  selectModel?: { [key: string]: string } | null;
};

type UseFlushNodeConfigArgs = {
  form: UseFormReturn<FieldValues>;
  nodeId?: string;
  nodeUniqueName: string;
  inputKeys: string[];
  outputKeys: string[];
  nodeLabel?: string;
  isLabelDirty: boolean;
  /** De-maps namespaced CallBlock output keys back to original names. */
  outputKeyMap?: Record<string, string>;
  extras?: FlushExtras;
};

/** Stable stringify with sorted object keys so key order never affects equality. */
export const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "";
  if (Array.isArray(value)) return `[${value.map((v) => stableStringify(v)).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`);
  return `{${entries.join(",")}}`;
};

/**
 * Shared commit for all node-config forms (DCP / CallAgent / CallBlock).
 *
 * Reads priors from the DCP store at flush time so boundary handlers never
 * use a stale closure. Values are persisted as-is regardless of validation:
 * incomplete/invalid configs are intentional mid-edit state the user expects
 * to keep after closing the panel and complete later. No validation runs and
 * no error/revert toasts are shown at any boundary.
 *
 * IMPORTANT NOTE: selector extras (selectAgent/selectBlock/selectModel) are
 * part of the change check — comparing inputs/outputs alone silently drops
 * selector-only changes.
 */
export const useFlushNodeConfig = ({
  form,
  nodeId,
  nodeUniqueName,
  inputKeys,
  outputKeys,
  nodeLabel,
  isLabelDirty,
  outputKeyMap,
  extras,
}: UseFlushNodeConfigArgs) => {
  const { updateNodeDataIO, updateFlowVariablesObject } = useUpdateNodeDataIO();

  const flushNow = async (): Promise<void> => {
    // Commit in-progress composite field edits (e.g. an unfinished tool) first;
    // these may not flip formState.isDirty on their own.
    const pendingFieldCommitted =
      useDynamicConfigPanelStore.getState().flushPendingFieldEdits?.() ?? false;

    if (!form.formState.isDirty && !pendingFieldCommitted && !isLabelDirty) {
      return;
    }

    const formData = form.getValues() as Record<string, unknown>;

    // Extract node inputs and outputs from formData
    const { inputs, outputs: rawOutputs } = refineSubmittedIO(
      nodeUniqueName,
      formData,
      inputKeys,
      outputKeys,
    );

    const outputs: NodeOutputType[] = outputKeyMap
      ? rawOutputs.map((output) => ({
          ...output,
          key: outputKeyMap[output.key] ?? output.key,
        }))
      : rawOutputs;

    if (!nodeId) {
      toast.error("Node id is undefined. Cannot update node data");
      console.error("Node id is undefined. Cannot update node data.");
      return;
    }

    // Read priors fresh so a flush in the same tick as a store update is correct
    const prior = useDynamicConfigPanelStore.getState().nodeData;
    const priorInputs: NodeInputType[] = prior?.inputs ?? [];
    const priorOutputs: NodeOutputType[] = prior?.outputs ?? [];

    const selectAgent = extras?.selectAgent ?? undefined;
    const selectBlock = extras?.selectBlock ?? undefined;
    const selectModel = extras?.selectModel ?? undefined;

    const isChanged =
      isLabelDirty ||
      stableStringify(inputs) !== stableStringify(priorInputs) ||
      stableStringify(outputs) !== stableStringify(priorOutputs) ||
      (selectAgent !== undefined &&
        stableStringify(selectAgent ?? null) !== stableStringify(prior?.selectedAgent ?? null)) ||
      (selectBlock !== undefined &&
        stableStringify(selectBlock ?? null) !== stableStringify(prior?.selectedBlock ?? null)) ||
      (selectModel !== undefined &&
        stableStringify(selectModel ?? null) !== stableStringify(prior?.selectedModel ?? null));

    if (isChanged) {
      updateNodeDataIO(nodeId, inputs, outputs, nodeLabel, selectAgent, selectBlock, selectModel);

      // Update flow variables object from real outputs or from SetVariableNode's dynamic variable name
      const variableName = formData["VariableName"]?.toString();
      if (nodeUniqueName === "SetVariableNode" && variableName) {
        updateFlowVariablesObject(nodeId, [
          {
            key: variableName,
            value: { value: variableName, enabled: true },
          },
        ]);
      } else if (outputs.length > 0) {
        updateFlowVariablesObject(nodeId, outputs);
      }
    }

    form.clearErrors();
    // Re-baseline the form so a subsequent boundary does not re-commit changes
    // that were just committed
    form.reset(form.getValues());
  };

  return { flushNow };
};
