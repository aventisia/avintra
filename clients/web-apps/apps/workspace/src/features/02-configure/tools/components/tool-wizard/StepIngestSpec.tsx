import { useEffect, useRef, useState } from "react";

import { isToolNameAvailable } from "../../apis/tools.apis";
import { ManualToolOperation } from "../../dtos";
import { useToolWizardStore } from "../../stores/tool-wizard.store";
import { synthesizeOpenApiSpec, toParsedSchema } from "../../utils/manual-openapi.util";
import { FieldLabel } from "./FieldLabel";
import { ManualMethodsEditor } from "./ManualMethodsEditor";

interface StepIngestSpecProps {
  crudAction?: "create" | "read" | "update";
}

export const StepIngestSpec = ({ crudAction }: StepIngestSpecProps) => {
  const {
    setDraftTool,
    draftTool,
    isNameAvailable,
    isNameCheckPending,
    nameAvailabilityMessage,
    setNameAvailability,
  } = useToolWizardStore();
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isCreate = crudAction === "create";

  // Debounced availability check for the tool name (create mode only).
  useEffect(() => {
    const name = draftTool?.name?.trim() ?? "";
    if (!isCreate || !name) {
      setNameAvailability({ isAvailable: true, isCheckPending: false, message: null });
      return;
    }

    setNameAvailability({
      isAvailable: true,
      isCheckPending: true,
      message: "Checking availability...",
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
              : `Tool name "${name}" already exists. Please enter a unique name.`,
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

  const getError = (field: "name" | "baseUrl") => {
    if (!touched[field]) return null;
    if (field === "name" && !draftTool?.name?.trim()) return "Name is required.";
    if (field === "baseUrl" && !draftTool?.baseUrl?.trim()) return "Base URL is required.";
    return null;
  };

  // Editing manual operations regenerates the OpenAPI spec client-side so the
  // saved tool is a normal spec-based tool.
  const updateManualOperations = (operations: ManualToolOperation[]) => {
    updateDraft({
      manualOperations: operations,
      openApiSpec:
        synthesizeOpenApiSpec(operations, {
          name: draftTool?.name,
          description: draftTool?.description,
        }) ?? undefined,
      parsedSchema: toParsedSchema(operations),
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <FieldLabel
          label="Unique Name"
          isRequired
          description={
            "A **unique** name for the tool.\n\n- **Max length:** 255 characters.\n- **Allowed characters:** any characters (letters, numbers, spaces and symbols).\n- **Cannot be changed** after creation."
          }
        />
        <input
          value={draftTool?.name ?? ""}
          onChange={(e) => updateDraft({ name: e.target.value })}
          onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
          placeholder="My Custom API Tool"
          disabled={crudAction === "update" || crudAction === "read"}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
        {isNameCheckPending ? (
          <p className="text-xs text-muted-foreground">{nameAvailabilityMessage}</p>
        ) : !isNameAvailable && isCreate ? (
          <p className="text-xs text-destructive">{nameAvailabilityMessage}</p>
        ) : isNameAvailable && isCreate && nameAvailabilityMessage ? (
          <p className="text-xs text-emerald-600">{nameAvailabilityMessage}</p>
        ) : null}
        {getError("name") && <p className="text-xs text-destructive">{getError("name")}</p>}
      </div>

      <div className="space-y-1.5">
        <FieldLabel label="Description" description="A short summary of what the tool does." />
        <textarea
          value={draftTool?.description ?? ""}
          onChange={(e) => updateDraft({ description: e.target.value })}
          placeholder="Describe what this tool does"
          rows={3}
          className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-1.5">
        <FieldLabel
          label="Base URL"
          isRequired
          description="The base URL of the external API the tool calls (e.g. https://api.example.com)."
        />
        <input
          value={draftTool?.baseUrl ?? ""}
          onChange={(e) => updateDraft({ baseUrl: e.target.value })}
          onBlur={() => setTouched((prev) => ({ ...prev, baseUrl: true }))}
          placeholder="https://api.example.com"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
        {getError("baseUrl") && <p className="text-xs text-destructive">{getError("baseUrl")}</p>}
      </div>

      <div className="space-y-1.5">
        <FieldLabel
          label="Methods"
          isRequired
          description="Each method is a distinct call this tool can make — its own type, endpoint, headers, parameters, and payload. The OpenAPI spec is generated from these methods."
        />
        <ManualMethodsEditor
          operations={draftTool?.manualOperations ?? []}
          onChange={updateManualOperations}
          disabled={crudAction === "read"}
        />
        {crudAction !== "read" &&
          !draftTool?.manualOperations?.some((op) => op.name.trim() && op.endpoint.trim()) &&
          touched.openApiSpec && (
            <p className="text-xs text-destructive">
              At least one method with a name and endpoint is required.
            </p>
          )}
      </div>

      {draftTool && (
        <div className="rounded border bg-muted/30 p-3">
          <p className="text-sm font-medium">Parsed: {draftTool.name}</p>
          {draftTool.parsedSchema && "operations" in draftTool.parsedSchema && (
            <p className="text-xs text-muted-foreground">
              {(draftTool.parsedSchema as { operations: unknown[] }).operations.length} method(s)
              defined
            </p>
          )}
        </div>
      )}
    </div>
  );
};
