import { cn } from "@avplatform/ui/lib";
import { WarningCircleIcon } from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState } from "react";

import { AvailabilityHint } from "@/components/card-dialog/AvailabilityHint";
import { FormField } from "@/components/card-dialog/FormField";
import { getFieldInputClassName } from "@/components/card-dialog/field-input.util";

import { isToolNameAvailable } from "../../apis/tools.apis";
import { ManualToolOperation, ToolDto } from "../../dtos";
import { useToolWizardStore } from "../../stores/tool-wizard.store";
import {
  isSynthesizedSpec,
  synthesizeOpenApiSpec,
  toParsedSchema,
} from "../../utils/manual-openapi.util";
import { isValidIconUrl } from "../../utils/tool-icon.util";
import { getOperationVerificationMap } from "../../utils/tool-operations.util";
import { FieldHint } from "./FieldHint";
import { ManualMethodsEditor } from "./ManualMethodsEditor";

const TOOL_NAME_MAX_LENGTH = 255;

type StepIngestSpecProps = {
  crudAction?: "create" | "read" | "update";
};

export const StepIngestSpec = ({ crudAction }: StepIngestSpecProps) => {
  const {
    setDraftTool,
    draftTool,
    isNameAvailable,
    isNameCheckPending,
    nameAvailabilityMessage,
    setNameAvailability,
    pendingVerifications,
    clearPendingVerifications,
  } = useToolWizardStore();
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isCreate = crudAction === "create";
  const fieldId = useId();
  const nameId = `${fieldId}-name`;
  const descriptionId = `${fieldId}-description`;
  const baseUrlId = `${fieldId}-base-url`;
  const iconUrlId = `${fieldId}-icon-url`;
  const methodsId = `${fieldId}-methods`;

  useEffect(() => {
    const name = draftTool?.name?.trim() ?? "";
    if (!isCreate || !name) {
      setNameAvailability({ isAvailable: true, isCheckPending: false, message: null });
      return;
    }

    setNameAvailability({
      isAvailable: true,
      isCheckPending: true,
      message: "Checking availability…",
    });

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      isToolNameAvailable({ userInput: name })
        .then((res) => {
          setNameAvailability({
            isAvailable: res.data.result,
            isCheckPending: false,
            message: res.data.result
              ? `${name} is available`
              : `A tool named “${name}” already exists.`,
          });
        })
        .catch(() => {
          setNameAvailability({ isAvailable: true, isCheckPending: false, message: null });
        });
    }, 800);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [draftTool?.name, isCreate, setNameAvailability]);

  const updateDraft = (patch: Partial<typeof draftTool>) => {
    setDraftTool(draftTool ? { ...draftTool, ...patch } : undefined);
  };

  const getError = (field: "name" | "baseUrl" | "iconUrl") => {
    if (!touched[field]) return null;
    if (field === "name" && !draftTool?.name?.trim()) return "Name is required.";
    if (field === "baseUrl" && !draftTool?.baseUrl?.trim()) return "Base URL is required.";
    if (field === "iconUrl" && !isValidIconUrl(draftTool?.iconUrl)) {
      return "Icon URL must be a valid URL.";
    }
    return null;
  };

  const rebuildManualArtifacts = (
    operations: ManualToolOperation[],
    overrides: Partial<ToolDto> = {},
  ) => {
    const name = overrides.name ?? draftTool?.name;
    const shouldSynthesize = isCreate || isSynthesizedSpec(draftTool?.openApiSpec);
    const synthesizedSpec = shouldSynthesize
      ? (synthesizeOpenApiSpec(operations, { name }) ?? "")
      : undefined;

    setDraftTool(
      draftTool
        ? {
            ...draftTool,
            ...overrides,
            manualOperations: operations,
            ...(synthesizedSpec !== undefined ? { openApiSpec: synthesizedSpec } : {}),
            parsedSchema: toParsedSchema(
              operations,
              getOperationVerificationMap(draftTool.parsedSchema),
              name,
              !shouldSynthesize,
            ),
          }
        : undefined,
    );
  };

  const markMethodsTouched = () =>
    setTouched((prev) => (prev.openApiSpec ? prev : { ...prev, openApiSpec: true }));

  const updateManualOperations = (operations: ManualToolOperation[]) => {
    markMethodsTouched();
    rebuildManualArtifacts(operations);
  };

  const nameError =
    getError("name") ??
    (isCreate && !isNameCheckPending && !isNameAvailable ? nameAvailabilityMessage : null);
  const hasMethod = (draftTool?.manualOperations ?? []).some(
    (op) => op.name.trim() && op.endpoint.trim(),
  );
  const methodsError =
    crudAction !== "read" && touched.openApiSpec && !hasMethod
      ? "Add at least one method with a name and endpoint."
      : null;

  return (
    <div className="space-y-4">
      <FormField
        htmlFor={nameId}
        label="Name"
        length={draftTool?.name?.length ?? 0}
        maxLength={TOOL_NAME_MAX_LENGTH}
        error={nameError}
        hint={
          isCreate && nameAvailabilityMessage ? (
            <AvailabilityHint
              message={{
                type: isNameCheckPending ? "Gray" : "Green",
                message: nameAvailabilityMessage,
              }}
            />
          ) : (
            <FieldHint>Unique, and can’t be changed after the tool is created.</FieldHint>
          )
        }
      >
        <input
          id={nameId}
          data-autofocus
          autoComplete="off"
          maxLength={TOOL_NAME_MAX_LENGTH}
          value={draftTool?.name ?? ""}
          onChange={(e) => {
            // IMPORTANT NOTE: operation IDs derive from the tool name, so renaming invalidates
            // playground tests recorded against the previous IDs and they must be redone.
            if (Object.keys(pendingVerifications).length > 0) {
              clearPendingVerifications();
            }
            rebuildManualArtifacts(draftTool?.manualOperations ?? [], { name: e.target.value });
          }}
          onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
          placeholder="e.g. Weather API"
          disabled={crudAction === "update" || crudAction === "read"}
          aria-invalid={Boolean(nameError)}
          className={cn(getFieldInputClassName(Boolean(nameError)), "h-11 disabled:bg-sunken")}
        />
      </FormField>

      <FormField htmlFor={descriptionId} label="Description" isOptional>
        <textarea
          id={descriptionId}
          value={draftTool?.description ?? ""}
          onChange={(e) => updateDraft({ description: e.target.value })}
          placeholder="What does this tool do?"
          rows={3}
          className={cn(getFieldInputClassName(false), "block resize-none py-2.5 leading-5")}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          htmlFor={baseUrlId}
          label="Base URL"
          error={getError("baseUrl")}
          hint={<FieldHint>The API every method calls.</FieldHint>}
        >
          <input
            id={baseUrlId}
            value={draftTool?.baseUrl ?? ""}
            onChange={(e) => updateDraft({ baseUrl: e.target.value })}
            onBlur={() => setTouched((prev) => ({ ...prev, baseUrl: true }))}
            placeholder="https://api.example.com"
            aria-invalid={Boolean(getError("baseUrl"))}
            className={cn(getFieldInputClassName(Boolean(getError("baseUrl"))), "h-11")}
          />
        </FormField>

        <FormField
          htmlFor={iconUrlId}
          label="Icon URL"
          isOptional
          error={getError("iconUrl")}
          hint={<FieldHint>Uses the default icon when empty.</FieldHint>}
        >
          <input
            id={iconUrlId}
            type="url"
            value={draftTool?.iconUrl ?? ""}
            onChange={(e) => updateDraft({ iconUrl: e.target.value })}
            onBlur={() => setTouched((prev) => ({ ...prev, iconUrl: true }))}
            placeholder="https://example.com/icon.svg"
            aria-invalid={Boolean(getError("iconUrl"))}
            className={cn(getFieldInputClassName(Boolean(getError("iconUrl"))), "h-11")}
          />
        </FormField>
      </div>

      <section aria-labelledby={methodsId}>
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <h3 id={methodsId} className="text-[12.5px] font-semibold text-ink-2">
            Methods
          </h3>
          <span className="text-[11px] tabular-nums text-muted-foreground">
            {(draftTool?.manualOperations ?? []).length} added
          </span>
        </div>
        <div onFocus={markMethodsTouched} onBlur={markMethodsTouched}>
          <ManualMethodsEditor
            operations={draftTool?.manualOperations ?? []}
            onChange={updateManualOperations}
            disabled={crudAction === "read"}
          />
        </div>
        {methodsError ? (
          <p className="flex items-center gap-1.5 pt-1.5 text-[12px] text-bad">
            <WarningCircleIcon className="size-3.5 shrink-0" />
            {methodsError}
          </p>
        ) : (
          <FieldHint>
            Each method is one request the tool can make. The OpenAPI spec is generated from them.
          </FieldHint>
        )}
      </section>
    </div>
  );
};
