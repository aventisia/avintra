import { Button } from "@avplatform/ui/buttons";
import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { toast } from "@avplatform/ui/sonner";
import { type DialogCrudAction } from "@avplatform/ui/types";
import { useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useState } from "react";

import { ResourceAccessTypeEnum } from "@/features/resource-user-access/enums/resource-access-type-enum";
import { getMergedQueryData } from "@/utils/get-merged-query-data.util";

import { createTool, getToolById, testTool, updateTool } from "../../apis/tools.apis";
import { DATA_QUERY_KEY, DETAIL_DATA_QUERY_KEY } from "../../constants/tools-table.constants";
import { ToolDto } from "../../dtos/index";
import { ComponentTypeEnum } from "../../enums/component-type-enum";
import { useTableTab } from "../../hooks/useTableTab.hook";
import { useToolWizardStore } from "../../stores/tool-wizard.store";
import { toManualOperations } from "../../utils/manual-openapi.util";
import { isValidIconUrl } from "../../utils/tool-icon.util";
import { normalizeParsedSchemaOperations } from "../../utils/tool-operations.util";
import { StepAuthenticate } from "./StepAuthenticate";
import { StepIngestSpec } from "./StepIngestSpec";
import { StepPlayground } from "./StepPlayground";

type ToolWizardProps = {
  crudAction: DialogCrudAction;
  rowId: string;
};

type PendingVerificationResult = {
  hasFailure: boolean;
  skippedOperationIds: string[];
};

const persistPendingVerifications = async (
  toolId: string,
  parsedSchema: object | undefined,
): Promise<PendingVerificationResult> => {
  const { pendingVerifications } = useToolWizardStore.getState();
  const operationIds = new Set(
    normalizeParsedSchemaOperations(parsedSchema).map((operation) => operation.operationId),
  );
  const skippedOperationIds: string[] = [];
  let hasFailure = false;

  for (const [operationId, parameters] of Object.entries(pendingVerifications)) {
    if (!operationIds.has(operationId)) {
      skippedOperationIds.push(operationId);
      continue;
    }

    try {
      const response = await testTool(toolId, { operationId, parameters });
      if (response.statusCode >= 400) hasFailure = true;
    } catch {
      hasFailure = true;
    }
  }

  return { hasFailure, skippedOperationIds };
};

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
  } = useToolWizardStore();
  const { onCloseConfirmed, setIsDirty } = useCrudDialogDirty();
  const queryClient = useQueryClient();
  const { queryKey } = useTableTab();

  const isCreate = crudAction === "create";

  const isNameValidForSubmit = !isCreate || (isNameAvailable && !isNameCheckPending);

  useEffect(() => {
    setCrudAction(crudAction);

    if (isCreate || !rowId) {
      reset();
      setDraftTool({
        id: crypto.randomUUID(),
        name: "",
        description: "",
        iconUrl: "",
        type: ComponentTypeEnum.Custom,
        baseUrl: "",
        openApiSpec: "",
        isTenantWideAccess: false,
        isResourceAccessRestricted: false,
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

      setDraftTool({ ...tool, manualOperations: toManualOperations(tool) });
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
    queryClient,
    queryKey,
  ]);

  const isIngestValid = Boolean(
    draftTool?.name?.trim() &&
    draftTool?.baseUrl?.trim() &&
    draftTool?.openApiSpec?.trim() &&
    isValidIconUrl(draftTool?.iconUrl),
  );

  const canProceed = isIngestValid && isNameValidForSubmit;

  const steps = [
    { key: "ingest", label: "Ingest Spec", component: <StepIngestSpec crudAction={crudAction} /> },
    { key: "authenticate", label: "Authenticate", component: <StepAuthenticate /> },
    {
      key: "playground",
      label: "Playground",
      component: <StepPlayground crudAction={crudAction} />,
    },
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
        const response = isCreate ? await createTool(draftTool) : await updateTool(draftTool);
        const savedTool = response.data;
        if (savedTool?.id) {
          setDraftTool({ ...draftTool, ...savedTool, id: savedTool.id });
          setDraftSaved(true);
        }

        if (isCreate && savedTool?.id) {
          const { hasFailure, skippedOperationIds } = await persistPendingVerifications(
            savedTool.id,
            savedTool.parsedSchema,
          );
          if (hasFailure) {
            toast.error(
              "Tool created, but one or more operation verifications could not be saved.",
            );
          }
          if (skippedOperationIds.length > 0) {
            toast.warning(
              `These tested operations were not found in the saved tool and stay unverified: ${skippedOperationIds.join(", ")}`,
            );
          }
        }

        queryClient.invalidateQueries({ queryKey: DATA_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: DETAIL_DATA_QUERY_KEY });
        reset();
        setIsDirty(false);
        onCloseConfirmed();
      } catch {
        // IMPORTANT NOTE: the shared axios interceptor already surfaces the save failure.
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
