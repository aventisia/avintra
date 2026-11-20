import { toast } from "@avplatform/ui/sonner";
import { getMutationErrorMessage } from "@avplatform/ui/utils";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { type ChangeEvent, useRef } from "react";
import { useMatch } from "react-router-dom";

import { getFlowToLoad, saveFlow } from "@/features/01-build/flow-builder";

import { insertFlow, isFlowNameAvailable } from "../apis/flows-table-apis";
import { FLOWS_QUERY_KEY, FOLDER_PAGE_PATH_PATTERN } from "../constants";
import type { FlowsTableDto } from "../dtos/flows-table-dto";
import type { FlowImportPayload } from "../types/flow-import.type";
import { readFlowImportFile } from "../utils/flow-import.util";
import { remapImportedFlowIds } from "../utils/remap-imported-flow-ids.util";

// IMPORTANT NOTE: the axios interceptor already toasts HTTP errors other than 400, 409 and 429,
// which it rejects with a plain message.
const isErrorUnannounced = (error: unknown) =>
  typeof error === "string" || !isAxiosError(error) || !error.response;

const suffixName = (name: string, suffix: number) => {
  const suffixText = ` (${suffix})`;
  return `${name.slice(0, 255 - suffixText.length)}${suffixText}`;
};

const resolveAvailableName = async (name: string) => {
  let candidate = name;
  let suffix = 1;

  while (!(await isFlowNameAvailable({ userInput: candidate })).data.result) {
    candidate = suffixName(name, suffix);
    suffix += 1;
  }

  return candidate;
};

const buildCreatePayload = (
  name: string,
  payload: FlowImportPayload,
  folderId: string | undefined,
) =>
  ({
    name,
    type: payload.type,
    description: payload.description,
    ...(folderId && { folderId }),
  }) as unknown as FlowsTableDto;

const saveImportedCanvas = async (flowId: string, payload: FlowImportPayload) => {
  const remapped = remapImportedFlowIds(payload.canvas, payload.flowVariablesObject);
  const { data: loadFlow } = await getFlowToLoad(flowId);

  await saveFlow({
    id: flowId,
    versionId: loadFlow.versionId,
    reactFlowObject: JSON.stringify(remapped.reactFlowObject),
    flowVariablesObject: JSON.stringify(remapped.flowVariablesObject),
    ...(payload.inputOutputObject && {
      inputOutputObject: JSON.stringify(payload.inputOutputObject),
    }),
    ...(payload.supportedPlatform && { supportedPlatform: payload.supportedPlatform }),
  });
};

/**
 * Opens a JSON file picker and creates the agent from the chosen export, at the folder of the
 * open folder page or at the top level.
 */
export const useImportFlow = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isImportingRef = useRef(false);

  // IMPORTANT NOTE: this button renders inside the routed folder page, unlike the create dialog
  // mounted above it, so the folder is read from the route match here.
  const folderPageMatch = useMatch(FOLDER_PAGE_PATH_PATTERN);
  const folderId = folderPageMatch?.params.folderId;

  const openFilePicker = () => fileInputRef.current?.click();

  const importFlowFile = async (file: File) => {
    if (isImportingRef.current) return;
    isImportingRef.current = true;

    try {
      const payload = await readFlowImportFile(file);
      const name = await resolveAvailableName(payload.name);

      let createdId: string | undefined;
      try {
        const { data: created } = await insertFlow(buildCreatePayload(name, payload, folderId));
        createdId = created?.id;
      } catch (error) {
        if (isErrorUnannounced(error)) toast.error(getMutationErrorMessage(error));
        return;
      }

      if (!createdId) {
        toast.error("Import failed to create the agent");
        return;
      }

      try {
        await saveImportedCanvas(createdId, payload);
      } catch {
        await queryClient.invalidateQueries({ queryKey: FLOWS_QUERY_KEY });
        toast.error(
          "The agent was created but the import could not be saved. Delete the blank agent and re-run the workspace Import.",
        );
        return;
      }

      await queryClient.invalidateQueries({ queryKey: FLOWS_QUERY_KEY });
      toast.success(`Imported agent ${name}`);
    } catch (error) {
      if (isErrorUnannounced(error)) toast.error(getMutationErrorMessage(error));
    } finally {
      isImportingRef.current = false;
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void importFlowFile(file);
  };

  return { fileInputRef, openFilePicker, handleFileChange };
};
