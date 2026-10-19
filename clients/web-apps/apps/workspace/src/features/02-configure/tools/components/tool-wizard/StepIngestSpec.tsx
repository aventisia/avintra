import { Button } from "@avplatform/ui/buttons";
import * as YAML from "js-yaml";
import { useEffect, useRef, useState } from "react";

import { JsonEditor } from "@/components/json-editor/JsonEditor";
import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";

import { isToolNameAvailable } from "../../apis/tools.apis";
import { ComponentTypeEnum } from "../../enums/component-type-enum";
import { useToolWizardStore } from "../../stores/tool-wizard.store";
import { FieldLabel } from "./FieldLabel";

interface StepIngestSpecProps {
  crudAction?: "create" | "read" | "update";
}

export const StepIngestSpec = ({ crudAction }: StepIngestSpecProps) => {
  const [activeTab, setActiveTab] = useState<"file" | "text">("text");
  const {
    specText,
    setSpecText,
    setSpecFile,
    setDraftTool,
    draftTool,
    isNameAvailable,
    isNameCheckPending,
    nameAvailabilityMessage,
    setNameAvailability,
  } = useToolWizardStore();
  const [parseError, setParseError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isCreate = crudAction === "create";

  useEffect(() => {
    if (specText.trim() && !draftTool?.parsedSchema) {
      parseSpec(specText, draftTool);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const getError = (field: "name" | "baseUrl" | "openApiSpec") => {
    if (!touched[field]) return null;
    if (field === "name" && !draftTool?.name?.trim()) return "Name is required.";
    if (field === "baseUrl" && !draftTool?.baseUrl?.trim()) return "Base URL is required.";
    if (field === "openApiSpec" && !draftTool?.openApiSpec?.trim())
      return "OpenAPI spec is required.";
    return null;
  };

  const parseSpec = (spec: string, currentDraft: typeof draftTool) => {
    setParseError(null);
    try {
      const trimmed = spec.trim();
      let parsed: Record<string, unknown>;
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        parsed = JSON.parse(trimmed) as Record<string, unknown>;
      } else {
        parsed = YAML.load(trimmed) as Record<string, unknown>;
      }
      const info = (parsed?.info ?? {}) as Record<string, unknown>;
      const paths = (parsed?.paths ?? {}) as Record<string, unknown>;

      const operations: Array<{
        operationId: string;
        method: string;
        path: string;
        summary?: string;
      }> = [];
      for (const [path, methods] of Object.entries(paths)) {
        for (const [method, details] of Object.entries(methods as Record<string, unknown>)) {
          if (!["get", "post", "put", "patch", "delete"].includes(method.toLowerCase())) continue;
          const op = details as Record<string, unknown>;
          operations.push({
            operationId: (op.operationId as string) ?? `${method}_${path}`,
            method: method.toUpperCase(),
            path,
            summary: op.summary as string | undefined,
          });
        }
      }

      setDraftTool({
        id: currentDraft?.id ?? (crudAction === "create" ? crypto.randomUUID() : undefined),
        name: currentDraft?.name ?? "",
        description: currentDraft?.description ?? (info.description as string) ?? "",
        type: ComponentTypeEnum.Custom,
        baseUrl: currentDraft?.baseUrl ?? "",
        openApiSpec: spec,
        parsedSchema: { operations },
        isTenantWideAccess: currentDraft?.isTenantWideAccess ?? false,
        isResourceAccessRestricted: currentDraft?.isResourceAccessRestricted ?? false,
        isActive: currentDraft?.isActive ?? false,
        isVerified: currentDraft?.isVerified ?? false,
        accessLevel: currentDraft?.accessLevel ?? ResourceAccessTypeEnum.Owner,
      });
      setTouched((prev) => ({ ...prev, openApiSpec: true }));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setParseError(`Failed to parse spec: ${message}`);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSpecFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setSpecText(text);
        parseSpec(text, draftTool);
      };
      reader.readAsText(file);
    }
  };

  const handleTextChange = (value: string) => {
    setSpecText(value);
    updateDraft({ openApiSpec: value });
    if (value.trim()) {
      parseSpec(value, draftTool);
    }
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
          label="OpenAPI Spec"
          isRequired
          description="Paste or upload the OpenAPI JSON or YAML specification that describes the API."
        />
        <div className="flex gap-2">
          <Button
            variant={activeTab === "file" ? "default" : "outline"}
            onClick={() => setActiveTab("file")}
          >
            Upload file
          </Button>
          <Button
            variant={activeTab === "text" ? "default" : "outline"}
            onClick={() => setActiveTab("text")}
          >
            Paste spec
          </Button>
        </div>

        {activeTab === "file" ? (
          <input
            type="file"
            accept=".json,.yaml,.yml"
            onChange={handleFileChange}
            onBlur={() => setTouched((prev) => ({ ...prev, openApiSpec: true }))}
            className="block w-full text-sm"
          />
        ) : (
          <JsonEditor
            value={specText}
            onChange={handleTextChange}
            placeholder={`Paste JSON or YAML OpenAPI spec here... e.g.
{
  "openapi": "3.0.0",
  "info": { "title": "My API" },
  "servers": [{ "url": "https://api.example.com" }],
  "paths": {}
}`}
          />
        )}
        {getError("openApiSpec") && (
          <p className="text-xs text-destructive">{getError("openApiSpec")}</p>
        )}
      </div>

      {parseError && <p className="text-sm text-destructive">{parseError}</p>}

      {draftTool && (
        <div className="rounded border bg-muted/30 p-3">
          <p className="text-sm font-medium">Parsed: {draftTool.name}</p>
          {draftTool.parsedSchema && "operations" in draftTool.parsedSchema && (
            <p className="text-xs text-muted-foreground">
              {(draftTool.parsedSchema as { operations: unknown[] }).operations.length} operation(s)
              found
            </p>
          )}
        </div>
      )}
    </div>
  );
};
