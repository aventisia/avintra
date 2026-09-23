import { Button } from "@avplatform/ui/buttons";
import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { type DialogCrudAction } from "@avplatform/ui/types";
import { useQueryClient } from "@tanstack/react-query";
import * as YAML from "js-yaml";
import { FormEvent, useEffect, useState } from "react";

import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";
import { getMergedQueryData } from "@/utils/get-merged-query-data.util";

import { getToolById, insertTool, updateTool } from "../../apis/tools.apis";
import { DATA_QUERY_KEY, DETAIL_DATA_QUERY_KEY } from "../../constants/tools-table.constants";
import { ToolDto } from "../../dtos/index";
import { ComponentTypeEnum } from "../../enums/component-type-enum";
import { useTableTab } from "../../hooks/useTableTab.hook";
import { useToolWizardStore } from "../../stores/tool-wizard.store";
import { StepAuthenticate } from "./StepAuthenticate";
import { StepIngestSpec } from "./StepIngestSpec";
import { StepPlayground } from "./StepPlayground";

interface ToolWizardProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

export const ToolWizard = ({ crudAction, rowId }: ToolWizardProps) => {
  const {
    currentStep,
    setCurrentStep,
    draftTool,
    isDraftSaved,
    isNameAvailable,
    isNameCheckPending,
    reset,
    setCrudAction,
    setDraftTool,
    setDraftSaved,
    setSpecText,
  } = useToolWizardStore();
  const { onCloseConfirmed, setIsDirty } = useCrudDialogDirty();
  const queryClient = useQueryClient();
  const { queryKey } = useTableTab();

  const isCreate = crudAction === "create";

  // Name availability gates create mode: the name must be unique (and not being checked).
  const isNameValidForSubmit = !isCreate || (isNameAvailable && !isNameCheckPending);

  useEffect(() => {
    setCrudAction(crudAction);

    if (isCreate || !rowId) {
      reset();
      setDraftTool({
        id: crypto.randomUUID(),
        name: "",
        description: "",
        type: ComponentTypeEnum.Custom,
        baseUrl: "",
        openApiSpec: "",
        isTenantWideAccess: false,
        isActive: false,
        isVerified: false,
        accessLevel: ResourceAccessTypeEnum.Owner,
      });
      return;
    }

    const loadTool = async () => {
      const cachedList = getMergedQueryData<ToolDto>(queryClient, queryKey);
      const cachedTool = cachedList?.data?.find((item) => item.id === rowId);
      let tool: ToolDto | undefined = cachedTool;
      if (!tool) {
        try {
          const response = await getToolById(rowId);
          tool = response.data;
        } catch {
          tool = undefined;
        }
      }

      if (!tool) return;

      const spec = tool.openApiSpec ?? "";
      let parsedSchema:
        | {
            operations: Array<{
              operationId: string;
              method: string;
              path: string;
              summary?: string;
            }>;
          }
        | undefined;
      if (spec.trim()) {
        try {
          const trimmed = spec.trim();
          const parsed =
            trimmed.startsWith("{") || trimmed.startsWith("[")
              ? JSON.parse(trimmed)
              : YAML.load(trimmed);
          const paths = (parsed?.paths ?? {}) as Record<string, unknown>;
          const operations: Array<{
            operationId: string;
            method: string;
            path: string;
            summary?: string;
          }> = [];
          for (const [path, methods] of Object.entries(paths)) {
            for (const [method, details] of Object.entries(methods as Record<string, unknown>)) {
              if (!["get", "post", "put", "patch", "delete"].includes(method.toLowerCase()))
                continue;
              const op = details as Record<string, unknown>;
              operations.push({
                operationId: (op.operationId as string) ?? `${method}_${path}`,
                method: method.toUpperCase(),
                path,
                summary: op.summary as string | undefined,
              });
            }
          }
          parsedSchema = { operations };
        } catch {
          // ignore parse errors on load
        }
      }

      setDraftTool({ ...tool, parsedSchema });
      setSpecText(spec);
      setDraftSaved(true);
    };

    loadTool();

    return () => {
      setCrudAction(undefined);
    };
  }, [
    crudAction,
    isCreate,
    rowId,
    reset,
    setCrudAction,
    setDraftTool,
    setDraftSaved,
    setSpecText,
    queryClient,
    queryKey,
  ]);

  // The synthesized spec gates progress: manual operations are converted to
  // JSON and stored in openApiSpec client-side, so a valid method set always
  // yields a non-empty spec.
  const hasValidManualOperation = Boolean(
    draftTool?.manualOperations?.length && draftTool?.openApiSpec?.trim(),
  );

  const isIngestValid = Boolean(
    draftTool?.name?.trim() &&
    draftTool?.baseUrl?.trim() &&
    (draftTool?.openApiSpec?.trim() || hasValidManualOperation),
  );

  const canProceed = isIngestValid && isNameValidForSubmit;

  const steps = [
    { key: "ingest", label: "Ingest Spec", component: <StepIngestSpec crudAction={crudAction} /> },
    { key: "authenticate", label: "Authenticate", component: <StepAuthenticate /> },
    { key: "playground", label: "Playground", component: <StepPlayground /> },
  ] as const;

  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  useEffect(() => {
    setIsDirty(true);
  }, [setIsDirty]);

  const [isSavePending, setIsSavePending] = useState(false);

  const handleFinish = () => {
    if (!draftTool) return;

    const saveAndClose = async () => {
      setIsSavePending(true);
      try {
        const response = isCreate ? await insertTool(draftTool) : await updateTool(draftTool);
        const savedTool = response.data;
        if (savedTool?.id) {
          setDraftTool({ ...draftTool, ...savedTool, id: savedTool.id });
          setDraftSaved(true);
        }
        queryClient.invalidateQueries({ queryKey: DATA_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: DETAIL_DATA_QUERY_KEY });
        reset();
        setIsDirty(false);
        onCloseConfirmed();
      } catch {
        // Error is surfaced by the axios interceptor; no extra toast needed.
      } finally {
        setIsSavePending(false);
      }
    };

    if (!isDraftSaved) {
      saveAndClose();
      return;
    }

    queryClient.invalidateQueries({ queryKey: DATA_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: DETAIL_DATA_QUERY_KEY });
    reset();
    setIsDirty(false);
    onCloseConfirmed();
  };

  return (
    <form onSubmit={(e: FormEvent) => e.preventDefault()}>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          {steps.map((step, index) => (
            <Button
              key={step.key}
              variant={currentStep === step.key ? "default" : "outline"}
              onClick={() => setCurrentStep(step.key)}
              disabled={index > currentIndex}
              type="button"
            >
              {index + 1}. {step.label}
            </Button>
          ))}
        </div>

        <div className="rounded-lg border p-4">{steps[currentIndex].component}</div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            disabled={currentIndex === 0}
            onClick={() => setCurrentStep(steps[currentIndex - 1].key)}
            type="button"
          >
            Previous
          </Button>
          <div className="flex gap-2">
            {currentIndex < steps.length - 1 ? (
              <Button
                disabled={currentIndex === steps.length - 1 || !canProceed}
                onClick={() => setCurrentStep(steps[currentIndex + 1].key)}
                type="button"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={!draftTool || isSavePending || !canProceed}
                type="button"
              >
                {isSavePending ? (isCreate ? "Creating..." : "Updating...") : "Finish"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};
