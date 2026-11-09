/* eslint-disable @typescript-eslint/no-explicit-any */
import { DotSeparator, EmptyState } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { cn } from "@avplatform/ui/lib";
import { Grip, PencilIcon, Trash2, TriangleAlert, Wrench } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { CustomToolIcon } from "@/features/action-selector/components/CustomToolIcon";
import { MultiSelectField } from "@/react-toolkit/ui/searchable-multi-select/MultiSelectField";
import { SearchableSelectField } from "@/react-toolkit/ui/searchable-select/SearchableSelectField";

import { ComponentTypeEnum } from "../../enums/component-type-enum";
import { ToolAuthenticationTypeEnum } from "../../enums/tool-authentication-type-enum";
import { useRegisterPendingFieldFlush } from "../../hooks/useRegisterFormFlush";
import { useUsableToolOperations, useUsableTools } from "../../hooks/useTools.hook";
import { APPROVAL_OPTIONS } from "../../stores/platform-tools";
import { normalizeToolOperations } from "../../utils/normalize-tool-operations.util";
import { GroupedFieldsWrapper } from "./GroupedFieldsWrapper";
import { VaultCredentialSelectField } from "./VaultCredentialSelectField";

type ToolsConfigFieldProps = {
  name: string;
  /** Locks the approval picker to auto; voice calls cannot pause for approval. */
  lockApprovalToAuto?: boolean;
};

export function ToolsConfigField({ name, lockApprovalToAuto = false }: ToolsConfigFieldProps) {
  const { control, setValue, getValues } = useFormContext();

  const defaultApproval = lockApprovalToAuto ? "auto" : "human";
  const approvalOptions = lockApprovalToAuto
    ? APPROVAL_OPTIONS.filter((option) => option.value === "auto")
    : APPROVAL_OPTIONS;

  const { fields, append, update, remove } = useFieldArray({
    control,
    name: name,
  });

  const { showCustomAlertDialog } = useShowAlertHandler();

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [initialEditTool, setInitialEditTool] = useState<string | null>(null);

  const [duplicateAttempted, setDuplicateAttempted] = useState<boolean>(false);

  const fieldNames = useMemo(
    () => ({
      tool: `${name}_tool`,
      credential_name: `${name}_credential_name`,
      actions: `${name}_actions`,
      approval: `${name}_approval`,
    }),
    [name],
  );

  const currentTool = useWatch({ control, name: fieldNames.tool });
  const currentCredential = useWatch({
    control,
    name: fieldNames.credential_name,
  });
  const currentActions = useWatch({ control, name: fieldNames.actions }) || [];
  const currentApproval = useWatch({ control, name: fieldNames.approval }) || defaultApproval;

  const { data: usableToolsResponse, isLoading: isUsableToolsLoading } = useUsableTools();
  const usableTools = useMemo(() => usableToolsResponse?.data ?? [], [usableToolsResponse]);

  const selectedUsableTool = useMemo(
    () => usableTools.find((tool) => tool.name === currentTool),
    [usableTools, currentTool],
  );

  const { data: toolOperationsResponse, isLoading: isToolOperationsLoading } =
    useUsableToolOperations(selectedUsableTool?.id);
  const availableOperations = useMemo(
    () => normalizeToolOperations(toolOperationsResponse?.data?.operations),
    [toolOperationsResponse],
  );
  const credentialType = toolOperationsResponse?.data?.credentialType;

  const toolOptions = useMemo(() => {
    const options = usableTools.map((tool) => ({
      label: tool.name,
      value: tool.name,
      icon: tool.icon,
    }));
    if (currentTool && !options.some((option) => option.value === currentTool)) {
      options.push({ label: currentTool, value: currentTool, icon: undefined });
    }
    return options;
  }, [usableTools, currentTool]);

  const isCustomTool = selectedUsableTool?.type === ComponentTypeEnum.Custom;
  const availableActionsForTool = useMemo(
    () =>
      availableOperations
        .filter((operation) => !isCustomTool || operation.isVerified)
        .map((operation) => ({
          label: operation.summary || operation.operationId,
          value: operation.operationId,
        })),
    [availableOperations, isCustomTool],
  );

  const toolByName = useMemo(
    () => new Map(usableTools.map((tool) => [tool.name, tool])),
    [usableTools],
  );

  const prevToolRef = useRef(currentTool);

  useEffect(() => {
    if (prevToolRef.current !== currentTool) {
      if (editingIndex === null || (editingIndex !== null && currentTool !== initialEditTool)) {
        setValue(fieldNames.credential_name, selectedUsableTool?.credentialName ?? "", {
          shouldValidate: true,
        });
        setValue(fieldNames.actions, [], { shouldValidate: true });
      }
      prevToolRef.current = currentTool;
    }
  }, [currentTool, editingIndex, initialEditTool, selectedUsableTool, setValue, fieldNames]);

  // IMPORTANT NOTE: voice calls cannot pause for approval, so previously saved human
  // approvals are migrated to auto without dirtying the form until the user saves.
  useEffect(() => {
    if (!lockApprovalToAuto) return;

    const stored = getValues(name);
    if (!Array.isArray(stored)) return;

    let changed = false;
    const migrated = stored.map((entry: any) => {
      if (!entry || !Array.isArray(entry.actions)) return entry;
      if (entry.actions.every((action: any) => action?.approval === "auto")) return entry;
      changed = true;
      return {
        ...entry,
        actions: entry.actions.map((action: any) => ({ ...action, approval: "auto" })),
      };
    });

    if (changed) setValue(name, migrated, { shouldValidate: true, shouldDirty: false });
  }, [lockApprovalToAuto, fields, name, getValues, setValue]);

  useEffect(() => {
    setDuplicateAttempted(false);
  }, [currentTool, currentApproval]);

  const requiresCredential =
    !selectedUsableTool ||
    selectedUsableTool.authenticationType !== ToolAuthenticationTypeEnum.None;

  const isDuplicate = useMemo(() => {
    return fields.some((f: any, idx: number) => {
      if (idx === editingIndex) return false;

      const fApproval = f.actions[0]?.approval || defaultApproval;
      return f.tool === currentTool && fApproval === currentApproval;
    });
  }, [fields, currentTool, currentApproval, editingIndex, defaultApproval]);

  const isAddDisabled =
    !currentTool || (requiresCredential && !currentCredential) || currentActions.length === 0;

  const isFieldDirty = Boolean(
    (currentTool || currentCredential || currentActions.length > 0) && editingIndex === null,
  );

  const handleResetField = () => {
    setEditingIndex(null);
    setInitialEditTool(null);
    setDuplicateAttempted(false);
    setValue(fieldNames.tool, "");
    setValue(fieldNames.credential_name, "");
    setValue(fieldNames.actions, []);
    setValue(fieldNames.approval, defaultApproval);
  };

  const handleSaveConfig = () => {
    if (isAddDisabled) return;

    if (isDuplicate) {
      setDuplicateAttempted(true);
      return;
    }

    const mappedActions = currentActions.map((a: string) => ({
      approval: lockApprovalToAuto ? "auto" : currentApproval,
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

  // IMPORTANT NOTE: a flush must commit an in-progress builder entry at panel-close, node-switch and before Save boundaries; incomplete or edit-mode entries are intentionally skipped.
  useRegisterPendingFieldFlush(() => {
    if (!isFieldDirty) return false;
    handleSaveConfig();
    return true;
  });

  const executeEdit = (index: number) => {
    const item = fields[index] as any;

    const flatActions = item.actions.map((a: any) => a.action);
    const approval = lockApprovalToAuto ? "auto" : item.actions[0]?.approval || defaultApproval;

    setValue(fieldNames.tool, item.tool);
    setValue(fieldNames.credential_name, item.credential_name);
    setValue(fieldNames.actions, flatActions);
    setValue(fieldNames.approval, approval);

    setEditingIndex(index);
    setInitialEditTool(item.tool);
    setDuplicateAttempted(false);
  };

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

  const onDeleteClick = (index: number) => {
    showCustomAlertDialog({
      title: "Delete tool configuration",
      description: "Are you sure you want to remove this tool configuration?",
      confirmBtnText: "Delete",
      isDestructive: true,
      confirmActionFn: () => {
        remove(index);
        if (editingIndex === index) {
          handleResetField();
        }
      },
    });
  };

  return (
    <GroupedFieldsWrapper groupName="Configure tools">
      <div className="space-y-4">
        <SearchableSelectField
          name={fieldNames.tool}
          label="Select tool"
          selectOptions={toolOptions}
          size="sm"
          placeholder="Select tool"
          isLoading={isUsableToolsLoading}
          disabled={isUsableToolsLoading}
          fallbackIcon={<Wrench className="h-4 w-4 shrink-0 text-muted-foreground" />}
        />

        <VaultCredentialSelectField
          name={fieldNames.credential_name}
          label="Select credential"
          size="sm"
          modelProvider={credentialType}
          disabled={!currentTool || isToolOperationsLoading}
          placeholder="Select credential"
        />

        <MultiSelectField
          name={fieldNames.actions}
          label="Select actions"
          options={availableActionsForTool}
          placeholder="Select actions"
          isRequired
          fieldSize="sm"
          disabled={!currentTool || isToolOperationsLoading || availableActionsForTool.length === 0}
          actionSelect={{
            options: approvalOptions,
            value: currentApproval,
            onChange: (val) => setValue(fieldNames.approval, val, { shouldValidate: true }),
          }}
        />

        {currentTool && !isToolOperationsLoading && availableActionsForTool.length === 0 && (
          <p className="text-2xs ml-1.5 font-medium text-muted-foreground">
            No operations found for this tool.
          </p>
        )}

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
            className="text-primary hover:text-primary bg-accent hover:bg-hover"
            onClick={handleSaveConfig}
            disabled={isAddDisabled}
          >
            {editingIndex !== null ? "Save changes" : "Add tool"}
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

      <div className="space-y-2.5">
        {fields.length === 0 ? (
          <EmptyState
            primaryMessage="No tools added"
            Icon={Grip}
            secondaryMessage="You have no tool configurations added."
          />
        ) : (
          fields.map((field: any, index) => {
            const toolConfigInfo = toolByName.get(field.tool);
            const actionNames = field.actions.map((a: any) => a.action);
            const approval = field.actions[0]?.approval || defaultApproval;
            const credentialName = field.credential_name || "";

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
                    <CustomToolIcon icon={toolConfigInfo?.icon} iconUrl={toolConfigInfo?.iconUrl} />
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
