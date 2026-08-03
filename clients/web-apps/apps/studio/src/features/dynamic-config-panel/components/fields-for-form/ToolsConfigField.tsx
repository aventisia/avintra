/* eslint-disable @typescript-eslint/no-explicit-any */
import { DotSeparator, NoContentMessage } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { cn } from "@avplatform/ui/lib";
import { Grip, PencilIcon, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { MultiSelectField } from "@/react-toolkit/ui/searchable-multi-select/MultiSelectField";
import { SearchableSelectField } from "@/react-toolkit/ui/searchable-select/SearchableSelectField";

import { APPROVAL_OPTIONS, TOOLS, TOOL_ACTIONS } from "../../stores/platform-tools";
import { CredentialsSelectField } from "./CredentialsSelectField";
import { GroupedFieldsWrapper } from "./GroupedFieldsWrapper";

interface ToolsConfigFieldProps {
  name: string;
}

export function ToolsConfigField({ name }: ToolsConfigFieldProps) {
  // Connect to the parent form context
  const { control, setValue } = useFormContext();

  // Manage the dynamic array of configured tools
  const { fields, append, update, remove } = useFieldArray({
    control,
    name: name,
  });

  const { showCustomAlertDialog } = useShowAlertHandler();

  // Track the index of the item currently being edited; null if adding a new item
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Track the original tool name when editing begins to determine if dependent fields need resetting
  const [initialEditTool, setInitialEditTool] = useState<string | null>(null);

  // Track if the user tried to save a duplicate, triggering the inline error
  const [duplicateAttempted, setDuplicateAttempted] = useState<boolean>(false);

  // Memoize builder field names to prevent unnecessary re-renders when passing to useWatch/setValue
  const fieldNames = useMemo(
    () => ({
      tool: `${name}_tool`,
      credential_id: `${name}_credential_id`,
      actions: `${name}_actions`,
      approval: `${name}_approval`,
    }),
    [name],
  );

  // Subscribe to builder input changes to drive conditional rendering and side effects
  const currentTool = useWatch({ control, name: fieldNames.tool });
  const currentCredential = useWatch({
    control,
    name: fieldNames.credential_id,
  });
  const currentActions = useWatch({ control, name: fieldNames.actions }) || [];
  const currentApproval = useWatch({ control, name: fieldNames.approval }) || "human";

  const prevToolRef = useRef(currentTool);

  // Clear dependent fields (credentials and actions) if the parent tool selection changes
  useEffect(() => {
    if (prevToolRef.current !== currentTool) {
      // Only clear if adding a new tool OR if editing but the user explicitly changed the tool type
      if (editingIndex === null || (editingIndex !== null && currentTool !== initialEditTool)) {
        setValue(fieldNames.credential_id, "", { shouldValidate: true });
        setValue(fieldNames.actions, [], { shouldValidate: true });
      }
      prevToolRef.current = currentTool;
    }
  }, [currentTool, editingIndex, initialEditTool, setValue, fieldNames]);

  // Hide the duplicate error message as soon as the user changes the tool or approval method
  useEffect(() => {
    setDuplicateAttempted(false);
  }, [currentTool, currentApproval]);

  // Derive available actions based on the currently selected tool
  const availableActionsForTool = useMemo(() => {
    if (!currentTool) return [];
    return TOOL_ACTIONS[currentTool] || [];
  }, [currentTool]);

  // Validation: Check if the user is trying to add an exact duplicate (same tool + same approval type)
  const isDuplicate = useMemo(() => {
    return fields.some((f: any, idx: number) => {
      // Skip duplicate check against the item currently being edited
      if (idx === editingIndex) return false;

      const fApproval = f.actions[0]?.approval || "human";
      return f.tool === currentTool && fApproval === currentApproval;
    });
  }, [fields, currentTool, currentApproval, editingIndex]);

  // Validation: Ensure required builder fields are populated (Duplicate check excluded so they can click the button to see the error)
  const isAddDisabled = !currentTool || !currentCredential || currentActions.length === 0;

  // Validation: Check if the builder form has unsaved data (used to trigger discard warnings)
  const isFieldDirty = Boolean(
    (currentTool || currentCredential || currentActions.length > 0) && editingIndex === null,
  );

  // Helper: Clears the builder inputs and resets editing state
  const handleResetField = () => {
    setEditingIndex(null);
    setInitialEditTool(null);
    setDuplicateAttempted(false);
    setValue(fieldNames.tool, "");
    setValue(fieldNames.credential_id, "");
    setValue(fieldNames.actions, []);
    setValue(fieldNames.approval, "human");
  };

  // Handler: Constructs the final object structure and commits it to the field array
  const handleSaveConfig = () => {
    if (isAddDisabled) return;

    // Show the inline duplicate error and stop the save process
    if (isDuplicate) {
      setDuplicateAttempted(true);
      return;
    }

    // Transform flat array of action strings into the required object array format
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
    } else {
      append(configData);
    }

    handleResetField();
  };

  // Helper: Populates the builder inputs with data from a specific array index
  const executeEdit = (index: number) => {
    const item = fields[index] as any;

    // Flatten the nested action objects back into an array of strings for the MultiSelect component
    const flatActions = item.actions.map((a: any) => a.action);
    const approval = item.actions[0]?.approval || "human";

    setValue(fieldNames.tool, item.tool);
    setValue(fieldNames.credential_id, item.credential_id);
    setValue(fieldNames.actions, flatActions);
    setValue(fieldNames.approval, approval);

    setEditingIndex(index);
    setInitialEditTool(item.tool);
    setDuplicateAttempted(false);
  };

  // Handler: Initiates edit mode, prompting for confirmation if unsaved builder data exists
  const onEditClick = (index: number) => {
    if (isFieldDirty) {
      showCustomAlertDialog({
        title: "Discard changes?",
        description:
          "You have unsaved changes in the tool configuration form. Are you sure you want to discard them and edit this entry?",
        confirmBtnText: "Discard changes",
        isDestructive: false,
        confirmActionFn: () => executeEdit(index),
      });
    } else {
      executeEdit(index);
    }
  };

  // Handler: Removes an item from the field array after user confirmation
  const onDeleteClick = (index: number) => {
    showCustomAlertDialog({
      title: "Delete Tool Configuration",
      description: "Are you sure you want to remove this tool configuration?",
      confirmBtnText: "Delete",
      isDestructive: true,
      confirmActionFn: () => {
        remove(index);
        // If the user deletes the item they are currently editing, reset the builder
        if (editingIndex === index) {
          handleResetField();
        }
      },
    });
  };

  const toolIconMapper: Record<string, string> = {
    googlegemini: "/brand-img/gemini.svg",
    outlook: "/brand-img/m365.svg",
    twilio: "/brand-img/twilio.svg",
    github: "/brand-img/github.svg",
  };

  const basePath = import.meta.env.VITE_STUDIO_PATH.replace(/\/$/, "");

  return (
    <GroupedFieldsWrapper groupName="Configure Tools">
      {/* Field Section */}
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
          modelProvider={currentTool == "outlook" ? "m365" : currentTool}
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
            onChange: (val) => setValue(fieldNames.approval, val, { shouldValidate: true }),
          }}
        />

        {/* Inline Error displays only when the user attempts to save a duplicate */}
        {duplicateAttempted && isDuplicate && (
          <p className="text-2xs ml-1.5 font-medium text-destructive">
            A configuration for this tool with{" "}
            <span className="capitalize">'{currentApproval}'</span> approval already exists.
          </p>
        )}

        <div className="flex gap-2 items-center justify-end ">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-primary hover:text-primary bg-accent hover:bg-indigo-100"
            onClick={handleSaveConfig}
            disabled={isAddDisabled}
          >
            {editingIndex !== null ? "Save Changes" : "Add Tool"}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetField}
            className="shrink-0"
          >
            {editingIndex !== null ? "Cancel" : "Reset"}
          </Button>
        </div>
      </div>

      <hr className="my-6 border-border" />

      {/* Configured List Section */}
      <div className="space-y-2.5">
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
            const approval = field.actions[0]?.approval || "human";
            const credentialId = field.credential_id || "";

            // Format actions for display, capping at 3 with an overflow indicator
            const displayActions = actionNames.slice(0, 3).join(", ");
            const extraCount = actionNames.length > 3 ? actionNames.length - 3 : 0;

            return (
              <div
                key={field.id}
                className={cn(
                  "flex items-center justify-between rounded-lg border bg-background p-2.5  transition-colors",
                  editingIndex === index ? "border-primary " : "border-border",
                )}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    className="flex h-6 w-6 items-center justify-center object-contain"
                    src={basePath + toolIconMapper[field.tool]}
                    alt={field.tool}
                  />
                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate text-2xs font-medium ">
                        {toolConfigInfo?.label || field.tool}
                      </h4>
                      <Badge className="shrink-0 rounded-full px-2 py-px text-[0.625rem] font-medium  bg-muted text-muted-foreground">
                        {credentialId}
                      </Badge>
                    </div>

                    <div className="mt-0.5 flex items-center gap-1.5 text-[0.65rem] text-muted-foreground">
                      <p className="truncate">{displayActions}</p>
                      {extraCount > 0 && (
                        <span className="shrink-0 rounded bg-muted px-1 py-0.5 text-[9px] font-medium text-muted-foreground">
                          +{extraCount}
                        </span>
                      )}
                      <DotSeparator className="mx-1" />
                      <Badge
                        className="shrink-0 rounded-full px-2 py-px text-[0.625rem] font-medium capitalize "
                        variant={"outline"}
                      >
                        {approval + " Approval"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="ml-2 flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size={"icon7"}
                    onClick={() => onEditClick(index)}
                    disabled={editingIndex !== null && editingIndex !== index}
                  >
                    <PencilIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                  <Button
                    type="button"
                    variant="caution"
                    size={"icon7"}
                    onClick={() => onDeleteClick(index)}
                    disabled={editingIndex === index}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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
