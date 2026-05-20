/* eslint-disable @typescript-eslint/no-explicit-any */
import { MultiSelectField } from "@/react-toolkit/ui/searchable-multi-select/MultiSelectField";
import { SearchableSelectField } from "@/react-toolkit/ui/searchable-select/SearchableSelectField";

import { NoContentMessage } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { Grip, PencilIcon, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import {
  APPROVAL_OPTIONS,
  TOOLS,
  TOOL_ACTIONS,
} from "../../stores/platform-tools";
import { CredentialsSelectField } from "./CredentialsSelectField";
import { GroupedFieldsWrapper } from "./GroupedFieldsWrapper";

interface ToolsConfigFieldProps {
  name: string;
}

export function ToolsConfigField({ name }: ToolsConfigFieldProps) {
  const { control, setValue } = useFormContext();

  const { fields, append, update, remove } = useFieldArray({
    control,
    name: name,
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const fieldNames = useMemo(
    () => ({
      tool: `${name}_tool`,
      credential_id: `${name}_credential_id`,
      actions: `${name}_actions`,
      approval: `${name}_approval`,
    }),
    [name],
  );

  const currentTool = useWatch({ control, name: fieldNames.tool });
  const currentCredential = useWatch({
    control,
    name: fieldNames.credential_id,
  });
  const currentActions = useWatch({ control, name: fieldNames.actions }) || [];
  const currentApproval =
    useWatch({ control, name: fieldNames.approval }) || "human";

  useEffect(() => {
    if (editingIndex === null) {
      setValue(fieldNames.credential_id, "", { shouldValidate: true });
      setValue(fieldNames.actions, [], { shouldValidate: true });
    }
  }, [currentTool, setValue, fieldNames, editingIndex]);

  const availableActionsForTool = useMemo(() => {
    if (!currentTool) return [];
    return TOOL_ACTIONS[currentTool] || [];
  }, [currentTool]);

  const isAddDisabled =
    !currentTool || !currentCredential || currentActions.length === 0;

  const handleSaveConfig = () => {
    if (isAddDisabled) return;

    const mappedActions = currentActions.map((a: string) => ({
      approval: currentApproval,
      action: a,
    }));

    const configData = {
      tool: currentTool,
      credential_id: currentCredential,
      actions: mappedActions,
    };

    if (editingIndex !== null) {
      update(editingIndex, configData);
      setEditingIndex(null);
    } else {
      append(configData);
    }

    setValue(fieldNames.tool, "");
    setValue(fieldNames.credential_id, "");
    setValue(fieldNames.actions, []);
    setValue(fieldNames.approval, "human");
  };

  const handleEdit = (index: number) => {
    const item = fields[index] as any;

    const flatActions = item.actions.map((a: any) => a.action);
    const approval = item.actions[0]?.approval || "human";

    setValue(fieldNames.tool, item.tool);
    setValue(fieldNames.credential_id, item.credential_id);
    setValue(fieldNames.actions, flatActions);
    setValue(fieldNames.approval, approval);
    setEditingIndex(index);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setValue(fieldNames.tool, "");
    setValue(fieldNames.credential_id, "");
    setValue(fieldNames.actions, []);
    setValue(fieldNames.approval, "human");
  };

  const toolIconMapper: Record<string, string> = {
    googlegemini: "/brand-img/gemini.svg",
    outlook: "/brand-img/m365.svg",
    twilio: "/brand-img/twilio.svg",
    github: "/brand-img/github.svg",
  };

  const basePath = import.meta.env.VITE_AGENTBUILDER_PATH.replace(/\/$/, "");

  return (
    <GroupedFieldsWrapper groupName="Configure Tools">
      <div className="space-y-4">
        <SearchableSelectField
          name={fieldNames.tool}
          label="Select Tool"
          selectOptions={TOOLS}
          size="sm"
          placeholder="Select Tool"
        />

        <CredentialsSelectField
          name={fieldNames.credential_id}
          label="Select Credential"
          size="sm"
          modelProvider={currentTool}
          disabled={!currentTool}
          placeholder="Select Credential"
        />

        <MultiSelectField
          name={fieldNames.actions}
          label="Select Actions"
          options={availableActionsForTool}
          placeholder="Select Actions"
          isRequired
          fieldSize="sm"
          disabled={!currentTool || availableActionsForTool.length === 0}
          actionSelect={{
            options: APPROVAL_OPTIONS,
            value: currentApproval,
            onChange: (val) =>
              setValue(fieldNames.approval, val, { shouldValidate: true }),
          }}
        />

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="w-full text-primary hover:text-primary"
            onClick={handleSaveConfig}
            disabled={isAddDisabled}
          >
            {editingIndex !== null ? (
              "Save Changes"
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Add Tool
              </>
            )}
          </Button>

          {editingIndex !== null && (
            <Button type="button" variant="ghost" onClick={handleCancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      <hr className="my-6 border-border" />

      <div className="space-y-3">
        {fields.length === 0 ? (
          <NoContentMessage
            primaryMessage="No tools added"
            Icon={Grip}
            secondaryMessage="You have no tool configurations added."
          />
        ) : (
          fields.map((field: any, index) => {
            const toolConfigInfo = TOOLS.find((t) => t.value === field.tool);
            const actionNames = field.actions.map((a: any) => a.action);
            const displayActions = actionNames.slice(0, 3).join(", ");
            const extraCount =
              actionNames.length > 3 ? actionNames.length - 3 : 0;

            return (
              <div
                key={field.id}
                className={cn(
                  "flex items-center justify-between rounded-lg border bg-background p-4 shadow-sm transition-colors",
                  editingIndex === index
                    ? "border-primary ring-1 ring-primary"
                    : "border-border",
                )}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <img
                      className="flex h-8 w-8 shrink-0 items-center justify-center"
                      src={basePath + toolIconMapper[field.tool]}
                      alt={field.tool}
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">
                      {toolConfigInfo?.label || field.tool}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <p className="max-w-72 truncate">{displayActions}</p>
                      {extraCount > 0 && (
                        <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          +{extraCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon7"
                    onClick={() => handleEdit(index)}
                    disabled={editingIndex !== null && editingIndex !== index}
                  >
                    <PencilIcon className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    type="button"
                    variant="caution"
                    size="icon7"
                    onClick={() => remove(index)}
                    disabled={editingIndex === index}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </GroupedFieldsWrapper>
  );
}
