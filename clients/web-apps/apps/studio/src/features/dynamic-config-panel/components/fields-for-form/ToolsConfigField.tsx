/* eslint-disable @typescript-eslint/no-explicit-any */
import { DotSeparator, NoContentMessage } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { cn } from "@avplatform/ui/lib";
import { Grip, PencilIcon, Trash2, TriangleAlert, Wrench } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { MultiSelectField } from "@/react-toolkit/ui/searchable-multi-select/MultiSelectField";
import { SearchableSelectField } from "@/react-toolkit/ui/searchable-select/SearchableSelectField";

import { ToolAuthenticationTypeEnum } from "../../enums/tool-authentication-type-enum";
import { useRegisterPendingFieldFlush } from "../../hooks/useRegisterFormFlush";
import { useUsableToolOperations, useUsableTools } from "../../hooks/useTools.hook";
import { APPROVAL_OPTIONS } from "../../stores/platform-tools";
import { normalizeToolOperations } from "../../utils/normalize-tool-operations.util";
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
      credential_name: `${name}_credential_name`,
      actions: `${name}_actions`,
      approval: `${name}_approval`,
    }),
    [name],
  );

  // Subscribe to builder input changes to drive conditional rendering and side effects
  const currentTool = useWatch({ control, name: fieldNames.tool });
  const currentCredential = useWatch({
    control,
    name: fieldNames.credential_name,
  });
  const currentActions = useWatch({ control, name: fieldNames.actions }) || [];
  const currentApproval = useWatch({ control, name: fieldNames.approval }) || "human";

  // Load the live list of usable tools from the registry
  const { data: usableToolsResponse, isLoading: isUsableToolsLoading } = useUsableTools();
  const usableTools = useMemo(() => usableToolsResponse?.data ?? [], [usableToolsResponse]);

  // Resolve the selected tool's registry entry
  const selectedUsableTool = useMemo(
    () => usableTools.find((tool) => tool.name === currentTool),
    [usableTools, currentTool],
  );

  // Fetch the selected tool's operations and credential type on demand
  const { data: toolOperationsResponse, isLoading: isToolOperationsLoading } =
    useUsableToolOperations(selectedUsableTool?.id);
  const availableOperations = useMemo(
    () => normalizeToolOperations(toolOperationsResponse?.data?.operations),
    [toolOperationsResponse],
  );
  const credentialType = toolOperationsResponse?.data?.credentialType;

  // Tool select options; inject the raw value as a temporary option when editing a stale entry
  const toolOptions = useMemo(() => {
    const options = usableTools.map((tool) => ({ label: tool.name, value: tool.name }));
    if (currentTool && !options.some((option) => option.value === currentTool)) {
      options.push({ label: currentTool, value: currentTool });
    }
    return options;
  }, [usableTools, currentTool]);

  // Actions are keyed by operationId; the summary is shown as the label when available
  const availableActionsForTool = useMemo(
    () =>
      availableOperations.map((operation) => ({
        label: operation.summary || operation.operationId,
        value: operation.operationId,
      })),
    [availableOperations],
  );

  // Lookup map for rendering the configured list
  const toolByName = useMemo(
    () => new Map(usableTools.map((tool) => [tool.name, tool])),
    [usableTools],
  );

  const prevToolRef = useRef(currentTool);

  // Clear dependent fields (credential and actions) if the parent tool selection changes.
  // The credential is pre-filled from the selected tool's default when available.
  useEffect(() => {
    if (prevToolRef.current !== currentTool) {
      // Only clear if adding a new tool OR if editing but the user explicitly changed the tool type
      if (editingIndex === null || (editingIndex !== null && currentTool !== initialEditTool)) {
        setValue(fieldNames.credential_name, selectedUsableTool?.credentialName ?? "", {
          shouldValidate: true,
        });
        setValue(fieldNames.actions, [], { shouldValidate: true });
      }
      prevToolRef.current = currentTool;
    }
  }, [currentTool, editingIndex, initialEditTool, selectedUsableTool, setValue, fieldNames]);

  // Hide the duplicate error message as soon as the user changes the tool or approval method
  useEffect(() => {
    setDuplicateAttempted(false);
  }, [currentTool, currentApproval]);

  // A credential is required unless the selected tool requires no authentication.
  // Stale (unresolved) tools keep the credential requirement.
  const requiresCredential =
    !selectedUsableTool ||
    selectedUsableTool.authenticationType !== ToolAuthenticationTypeEnum.None;

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
  const isAddDisabled =
    !currentTool || (requiresCredential && !currentCredential) || currentActions.length === 0;

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
    setValue(fieldNames.credential_name, "");
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
      credential_name: currentCredential,
      actions: mappedActions,
    };

    if (editingIndex !== null) {
      update(editingIndex, configData);
    } else {
      append(configData);
    }

    handleResetField();
  };

  // Commit an in-progress builder entry when the form is flushed at a boundary
  // (panel close / node switch / before Save). No-op unless the builder holds a
  // new entry; edit-mode and incomplete entries are skipped (the original array
  // item / nothing is persisted, so nothing is lost).
  useRegisterPendingFieldFlush(() => {
    if (!isFieldDirty) return false;
    handleSaveConfig();
    return true;
  });

  // Helper: Populates the builder inputs with data from a specific array index
  const executeEdit = (index: number) => {
    const item = fields[index] as any;

    // Flatten the nested action objects back into an array of strings for the MultiSelect component
    const flatActions = item.actions.map((a: any) => a.action);
    const approval = item.actions[0]?.approval || "human";

    setValue(fieldNames.tool, item.tool);
    setValue(fieldNames.credential_name, item.credential_name);
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

  return (
    <GroupedFieldsWrapper groupName="Configure Tools">
      {/* Field Section */}
      <div className="space-y-4">
        <SearchableSelectField
          name={fieldNames.tool}
          label="Select Tool"
          selectOptions={toolOptions}
          size="sm"
          placeholder="Select Tool"
          isLoading={isUsableToolsLoading}
          disabled={isUsableToolsLoading}
        />

        <CredentialsSelectField
          name={fieldNames.credential_name}
          label="Select Credential"
          size="sm"
          modelProvider={credentialType}
          disabled={!currentTool || isToolOperationsLoading}
          placeholder="Select Credential"
        />

        <MultiSelectField
          name={fieldNames.actions}
          label="Select Actions"
          options={availableActionsForTool}
          placeholder="Select Actions"
          isRequired
          fieldSize="sm"
          disabled={!currentTool || isToolOperationsLoading || availableActionsForTool.length === 0}
          actionSelect={{
            options: APPROVAL_OPTIONS,
            value: currentApproval,
            onChange: (val) => setValue(fieldNames.approval, val, { shouldValidate: true }),
          }}
        />

        {/* Inform the user when the selected tool exposes no operations */}
        {currentTool && !isToolOperationsLoading && availableActionsForTool.length === 0 && (
          <p className="text-2xs ml-1.5 font-medium text-muted-foreground">
            No operations found for this tool.
          </p>
        )}

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
            const toolConfigInfo = toolByName.get(field.tool);
            const actionNames = field.actions.map((a: any) => a.action);
            const approval = field.actions[0]?.approval || "human";
            const credentialName = field.credential_name || "";

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
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted">
                    <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate text-2xs font-medium ">
                        {toolConfigInfo?.name || field.tool}
                      </h4>
                      {!toolConfigInfo && (
                        <Badge className="shrink-0 gap-1 rounded-full px-2 py-px text-[0.625rem] font-medium bg-destructive/10 text-destructive">
                          <TriangleAlert className="h-3 w-3" />
                          Unavailable
                        </Badge>
                      )}
                      <Badge className="shrink-0 rounded-full px-2 py-px text-[0.625rem] font-medium  bg-muted text-muted-foreground">
                        {credentialName}
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
