import {
  CrudDialogActions,
  useCrudDialogDirty,
  useCrudDialogRecordNameSetter,
} from "@avplatform/ui/crud-dialog";
import { cn } from "@avplatform/ui/lib";
import { toast } from "@avplatform/ui/sonner";
import { type DialogCrudAction } from "@avplatform/ui/types";
import { ArrowRightIcon, CheckIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
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

const createEmptyDraft = (): ToolDto => ({
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

type WizardStepperProps = {
  labels: readonly string[];
  currentIndex: number;
  onSelect: (index: number) => void;
};

const WizardStepper = ({ labels, currentIndex, onSelect }: WizardStepperProps) => (
  <ol aria-label="Steps" className="mb-5 flex items-center gap-2">
    {labels.map((label, index) => {
      const isDone = index < currentIndex;
      const isCurrent = index === currentIndex;
      const isLast = index === labels.length - 1;

      return (
        <li key={label} className={cn("flex min-w-0 items-center gap-2", !isLast && "flex-1")}>
          <button
            type="button"
            onClick={() => onSelect(index)}
            disabled={index > currentIndex}
            aria-current={isCurrent ? "step" : undefined}
            className="flex min-w-0 items-center gap-2 rounded-md text-[12.5px] outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-default"
          >
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold tabular-nums ring-1 transition-colors",
                isDone && "bg-primary text-primary-foreground ring-primary",
                isCurrent && "bg-selected text-primary-text ring-primary",
                !isDone && !isCurrent && "bg-sunken text-muted-foreground ring-line",
              )}
            >
              {isDone ? <CheckIcon weight="bold" className="size-3.5" /> : index + 1}
            </span>
            <span
              className={cn(
                "truncate font-semibold",
                isDone || isCurrent ? "text-ink" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </button>
          {!isLast && (
            <span
              aria-hidden="true"
              className={cn("h-px min-w-4 flex-1", isDone ? "bg-primary" : "bg-line")}
            />
          )}
        </li>
      );
    })}
  </ol>
);

/**
 * Create or edit a custom API tool in three steps: methods, authentication and a playground
 * that verifies each operation.
 */
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
  const setRecordName = useCrudDialogRecordNameSetter();
  const queryClient = useQueryClient();
  const { queryKey } = useTableTab();
  const [baselineDraft, setBaselineDraft] = useState<ToolDto>();
  const [isSavePending, setIsSavePending] = useState(false);

  const isCreate = crudAction === "create";

  const isNameValidForSubmit = !isCreate || (isNameAvailable && !isNameCheckPending);

  useEffect(() => {
    setCrudAction(crudAction);

    if (isCreate || !rowId) {
      reset();
      const emptyDraft = createEmptyDraft();
      setBaselineDraft(emptyDraft);
      setDraftTool(emptyDraft);
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

      const loadedDraft = { ...tool, manualOperations: toManualOperations(tool) };
      setBaselineDraft(loadedDraft);
      setDraftTool(loadedDraft);
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

  const isDirty = Boolean(draftTool && baselineDraft) && draftTool !== baselineDraft;

  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  useEffect(() => {
    setRecordName(draftTool?.name ?? "");
  }, [draftTool?.name, setRecordName]);

  useEffect(() => () => setRecordName(undefined), [setRecordName]);

  const isIngestValid = Boolean(
    draftTool?.name?.trim() &&
    draftTool?.baseUrl?.trim() &&
    draftTool?.openApiSpec?.trim() &&
    isValidIconUrl(draftTool?.iconUrl),
  );

  const canProceed = isIngestValid && isNameValidForSubmit;

  const steps = [
    { key: "ingest", label: "Details", component: <StepIngestSpec crudAction={crudAction} /> },
    { key: "authenticate", label: "Authenticate", component: <StepAuthenticate /> },
    {
      key: "playground",
      label: "Playground",
      component: <StepPlayground crudAction={crudAction} />,
    },
  ] as const;

  const currentIndex = steps.findIndex((s) => s.key === currentStep);
  const isLastStep = currentIndex === steps.length - 1;

  const closeAfterSave = () => {
    queryClient.invalidateQueries({ queryKey: DATA_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: DETAIL_DATA_QUERY_KEY });
    reset();
    setIsDirty(false);
    onCloseConfirmed();
  };

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

        closeAfterSave();
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

    closeAfterSave();
  };

  const finishLabel = isSavePending
    ? isCreate
      ? "Creating"
      : "Saving"
    : isCreate
      ? "Create tool"
      : "Save changes";

  return (
    <div>
      <WizardStepper
        labels={steps.map((step) => step.label)}
        currentIndex={currentIndex}
        onSelect={(index) => setCurrentStep(steps[index].key)}
      />

      {steps[currentIndex].component}

      <CrudDialogActions>
        {currentIndex > 0 && (
          <CardDialogButton
            onClick={() => setCurrentStep(steps[currentIndex - 1].key)}
            disabled={isSavePending}
          >
            Previous
          </CardDialogButton>
        )}
        {isLastStep ? (
          <CardDialogButton
            variant="primary"
            onClick={handleFinish}
            disabled={!draftTool || isSavePending || !canProceed}
            isBusy={isSavePending}
          >
            {finishLabel}
          </CardDialogButton>
        ) : (
          <CardDialogButton
            variant="primary"
            onClick={() => setCurrentStep(steps[currentIndex + 1].key)}
            disabled={!canProceed}
          >
            Next
            <ArrowRightIcon className="size-4" />
          </CardDialogButton>
        )}
      </CrudDialogActions>
    </div>
  );
};
