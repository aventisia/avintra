/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@avplatform/ui/buttons";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { cn } from "@avplatform/ui/lib";
import {
  CheckIcon,
  KeyIcon,
  LightningIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
  WarningIcon,
  WrenchIcon,
  XIcon,
} from "@phosphor-icons/react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
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
import { ConfigFieldCard, ConfigFieldCount } from "./ConfigFieldCard";
import { VaultCredentialSelectField } from "./VaultCredentialSelectField";

type ToolsConfigFieldProps = {
  name: string;
  /** Locks the approval picker to auto; voice calls cannot pause for approval. */
  lockApprovalToAuto?: boolean;
  /** Renders the body without its card, for a host that frames it. */
  hideGroup?: boolean;
};

export function ToolsConfigField({
  name,
  lockApprovalToAuto = false,
  hideGroup = false,
}: ToolsConfigFieldProps) {
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

  const [isComposerOpen, setIsComposerOpen] = useState(false);

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
    setIsComposerOpen(false);
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

  const isEditing = editingIndex !== null;
  const showComposer = fields.length === 0 || isComposerOpen || isEditing || isFieldDirty;

  const closeComposer = () => {
    handleResetField();
    setIsComposerOpen(false);
  };

  const toolList = fields.length > 0 && (
    <ul aria-label="Configured tools" className="space-y-2">
      {fields.map((field: any, index) => {
        const toolConfigInfo = toolByName.get(field.tool);
        const actionNames: string[] = field.actions.map((a: any) => a.action);
        const approval = field.actions[0]?.approval || defaultApproval;
        const credentialName = field.credential_name || "";
        const shownActions = actionNames.slice(0, 4);
        const extraCount = actionNames.length - shownActions.length;
        const isRowEditing = editingIndex === index;

        return (
          <li
            key={field.id}
            className={cn(
              "group/tool flex items-start gap-3 rounded-md border bg-surface p-3 transition-colors duration-150 animate-in fade-in",
              isRowEditing
                ? "border-primary shadow-[inset_0_0_0_1px_var(--primary-base)]"
                : "border-line hover:border-line-strong/60",
            )}
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-md bg-sunken ring-1 ring-inset ring-line">
              <CustomToolIcon icon={toolConfigInfo?.icon} iconUrl={toolConfigInfo?.iconUrl} />
            </span>

            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                <h4 className="truncate text-body-sm font-semibold text-ink">
                  {toolConfigInfo?.name || field.tool}
                </h4>
                {!toolConfigInfo && !isUsableToolsLoading && (
                  <span className="flex h-5 items-center gap-1 rounded-sm border border-bad/30 px-1.5 font-mono text-label uppercase text-bad">
                    <WarningIcon aria-hidden="true" className="size-3" />
                    Unavailable
                  </span>
                )}
                {isRowEditing && (
                  <span className="flex h-5 items-center rounded-sm border border-[color-mix(in_srgb,var(--primary-base)_32%,transparent)] px-1.5 font-mono text-label uppercase text-primary-text">
                    Editing
                  </span>
                )}
              </div>

              <ul aria-label="Actions" className="flex flex-wrap gap-1">
                {shownActions.map((action) => (
                  <li
                    key={action}
                    className="max-w-full truncate rounded-sm bg-sunken px-1.5 py-0.5 font-mono text-[11.5px] leading-4 text-ink-2"
                  >
                    {action}
                  </li>
                ))}
                {extraCount > 0 && (
                  <li
                    title={actionNames.slice(shownActions.length).join(", ")}
                    className="rounded-sm px-1.5 py-0.5 font-mono text-[11.5px] leading-4 text-muted-foreground"
                  >
                    +{extraCount} more
                  </li>
                )}
              </ul>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-hint text-muted-foreground">
                {credentialName && (
                  <span className="flex min-w-0 items-center gap-1">
                    <KeyIcon aria-hidden="true" className="size-3.5 shrink-0" />
                    <span className="truncate">{credentialName}</span>
                  </span>
                )}
                {!lockApprovalToAuto && (
                  <span className="flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "size-1.5 rounded-full",
                        approval === "auto" ? "bg-ok" : "bg-warn",
                      )}
                    />
                    {approval === "auto" ? "Runs automatically" : "Asks a person first"}
                  </span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-0.5 opacity-70 transition-opacity group-hover/tool:opacity-100 group-focus-within/tool:opacity-100">
              <Button
                type="button"
                variant="ghost"
                size="icon6"
                aria-label={`Edit ${toolConfigInfo?.name || field.tool}`}
                onClick={() => onEditClick(index)}
                disabled={isEditing && !isRowEditing}
                className="text-muted-foreground"
              >
                <PencilSimpleIcon aria-hidden="true" className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon6"
                aria-label={`Remove ${toolConfigInfo?.name || field.tool}`}
                onClick={() => onDeleteClick(index)}
                disabled={isRowEditing}
                className="text-muted-foreground hover:bg-bad/10 hover:text-bad"
              >
                <TrashIcon aria-hidden="true" className="size-3.5" />
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );

  const composer = showComposer ? (
    <div className="overflow-hidden rounded-md border border-line bg-surface animate-in fade-in duration-150">
      <div className="flex items-center gap-2 border-b border-line bg-sunken/50 px-3 py-2">
        <span className="font-mono text-label uppercase text-muted-foreground">
          {isEditing ? "Edit" : "New"}
        </span>
        <span className="min-w-0 flex-1 truncate text-body-sm font-semibold text-ink">
          {isEditing
            ? currentTool || "Tool"
            : fields.length === 0
              ? "Give the agent its first tool"
              : "Add a tool"}
        </span>
        {fields.length > 0 && !isEditing && (
          <Button
            type="button"
            variant="ghost"
            size="icon6"
            aria-label="Close"
            onClick={closeComposer}
            className="text-muted-foreground"
          >
            <XIcon aria-hidden="true" className="size-3.5" />
          </Button>
        )}
      </div>

      <ol className="space-y-3 p-3">
        <ComposerStep step={1} isDone={Boolean(currentTool)}>
          <SearchableSelectField
            name={fieldNames.tool}
            label="Tool"
            selectOptions={toolOptions}
            size="sm"
            placeholder="Pick a tool"
            isLoading={isUsableToolsLoading}
            disabled={isUsableToolsLoading}
            fallbackIcon={<WrenchIcon className="h-4 w-4 shrink-0 text-muted-foreground" />}
          />
        </ComposerStep>

        <ComposerStep step={2} isDone={!requiresCredential || Boolean(currentCredential)}>
          <VaultCredentialSelectField
            name={fieldNames.credential_name}
            label="Credential"
            size="sm"
            modelProvider={credentialType}
            disabled={!currentTool || isToolOperationsLoading}
            placeholder={requiresCredential ? "Pick a credential" : "Not needed for this tool"}
          />
        </ComposerStep>

        <ComposerStep step={3} isDone={currentActions.length > 0} isLast>
          <MultiSelectField
            name={fieldNames.actions}
            label="Actions"
            options={availableActionsForTool}
            placeholder="Pick what it may do"
            isRequired
            fieldSize="sm"
            disabled={
              !currentTool || isToolOperationsLoading || availableActionsForTool.length === 0
            }
            actionSelect={
              lockApprovalToAuto
                ? undefined
                : {
                    options: approvalOptions,
                    value: currentApproval,
                    onChange: (val) => setValue(fieldNames.approval, val, { shouldValidate: true }),
                  }
            }
          />
          {currentTool && !isToolOperationsLoading && availableActionsForTool.length === 0 && (
            <p className="mt-1.5 text-hint text-muted-foreground">
              This tool has no actions to offer.
            </p>
          )}
          {lockApprovalToAuto && (
            <p className="mt-1.5 flex items-center gap-1.5 text-hint text-muted-foreground">
              <LightningIcon aria-hidden="true" className="size-3.5 shrink-0" />
              Calls can't pause for approval, so actions run automatically.
            </p>
          )}
        </ComposerStep>
      </ol>

      {duplicateAttempted && isDuplicate && (
        <p role="alert" className="px-3 pb-2 text-hint text-bad">
          {lockApprovalToAuto ? (
            "This tool is already added. Edit it in the list above."
          ) : (
            <>
              This tool already has a {currentApproval === "auto" ? "automatic" : "human-approved"}{" "}
              entry.
            </>
          )}
        </p>
      )}

      <div className="flex items-center justify-end gap-2 border-t border-line px-3 py-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={fields.length > 0 && !isEditing ? closeComposer : handleResetField}
          disabled={!isEditing && !isFieldDirty && fields.length === 0}
        >
          {isEditing || fields.length > 0 ? "Cancel" : "Clear"}
        </Button>
        <Button type="button" size="sm" onClick={handleSaveConfig} disabled={isAddDisabled}>
          {isEditing ? "Save changes" : "Add tool"}
        </Button>
      </div>
    </div>
  ) : (
    <Button
      type="button"
      variant="outline"
      onClick={() => setIsComposerOpen(true)}
      className="w-full border-dashed text-muted-foreground"
    >
      <PlusIcon aria-hidden="true" className="mr-1.5 size-3.5" />
      Add a tool
    </Button>
  );

  const body = (
    <div className="space-y-3">
      {toolList}
      {composer}
    </div>
  );

  if (hideGroup) return body;

  return (
    <ConfigFieldCard
      Icon={WrenchIcon}
      tone="primary"
      label="Can do"
      title="Tools"
      description="Actions the agent can take in other apps."
      aside={
        <ConfigFieldCount count={fields.length} noun={fields.length === 1 ? "tool" : "tools"} />
      }
    >
      {body}
    </ConfigFieldCard>
  );
}

/** One numbered step of the tool composer, on a short wire to the next step. */
const ComposerStep = ({
  step,
  isDone,
  isLast = false,
  children,
}: {
  step: number;
  isDone: boolean;
  isLast?: boolean;
  children: ReactNode;
}) => (
  <li className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-2.5">
    <span aria-hidden="true" className="flex flex-col items-center pt-0.5">
      <span
        className={cn(
          "grid size-5 shrink-0 place-items-center rounded-full font-mono text-[10px] transition-colors duration-150",
          isDone ? "bg-ok text-surface" : "border border-line-strong text-muted-foreground",
        )}
      >
        {isDone ? <CheckIcon weight="bold" className="size-2.5" /> : step}
      </span>
      {!isLast && (
        <span
          className={cn(
            "mt-1 w-px flex-1",
            isDone ? "bg-[color-mix(in_srgb,var(--ok)_55%,var(--line))]" : "bg-line",
          )}
        />
      )}
    </span>
    <div className="min-w-0">{children}</div>
  </li>
);
