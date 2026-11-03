import { useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import { FolderGlyph } from "@avplatform/ui/folder-glyph";
import { cn } from "@avplatform/ui/lib";
import { toast } from "@avplatform/ui/sonner";
import { getMutationErrorMessage } from "@avplatform/ui/utils";
import { ArrowRight, Info } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { AgentAvatar } from "@/components/AgentAvatar";
import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { FormField } from "@/components/card-dialog/FormField";
import { StatusLine } from "@/components/card-dialog/StatusLine";
import { getFieldInputClassName } from "@/components/card-dialog/field-input.util";
import { useCurrentSpaceStore } from "@/stores/current-space-store";

import {
  FOLDER_DESCRIPTION_MAX_LENGTH,
  FOLDER_NAME_MAX_LENGTH,
} from "../../constants/folder-zod-schema.constant";
import { FoldersTableRowDto } from "../../dtos/folders-table-row.dto";
import { useFolderForm } from "../../hooks/useFolderForm.hook";
import { useMoveFlowToFolder } from "../../hooks/useMoveFlowToFolder.hook";
import { useSaveFolder } from "../../hooks/useSaveFolder.hook";
import { FolderColor } from "../../types/folder-color.type";
import { MovableAgent } from "../../types/movable-agent.type";
import { FolderMark } from "../folder/FolderMark";
import { FolderColorPicker } from "./FolderColorPicker";

type FolderFormDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  folders: FoldersTableRowDto[];
  /** Folder to edit; omitted to create one. */
  folder?: FoldersTableRowDto;
  /** Agent moved into the new folder once it is created. */
  agentToMove?: MovableAgent;
};

type AgentToMoveCalloutProps = {
  agent: MovableAgent;
  folderName: string;
  folderColor: FolderColor;
};

const AgentToMoveCallout = ({ agent, folderName, folderColor }: AgentToMoveCalloutProps) => (
  <div className="flex items-center gap-3 rounded-md bg-sunken px-3.5 py-3 ring-1 ring-line">
    <AgentAvatar size="md" />
    <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
    <FolderMark color={folderColor} size="sm" />
    <p className="min-w-0 text-[12.5px] leading-5 text-ink-2">
      <span className="font-semibold text-ink">{agent.name}</span> moves into{" "}
      <span className="font-semibold text-ink">{folderName || "this folder"}</span> once it is
      created.
    </p>
  </div>
);

/**
 * Create or edit a folder's name, color and description.
 */
export const FolderFormDialog = ({
  isOpen,
  onClose,
  folders,
  folder,
  agentToMove,
}: FolderFormDialogProps) => {
  const { setIsDirty, onCloseConfirmed } = useCrudDialogDirty();
  const isEditing = Boolean(folder);
  const spaceName = useCurrentSpaceStore((state) => state.currentSpace?.name ?? "Central");
  const { form, name, description, color, isNameTaken } = useFolderForm(folders, folder);
  const { saveFolder, isSaving } = useSaveFolder();
  const { moveFlow } = useMoveFlowToFolder();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fieldId = useId();
  const formId = `${fieldId}-form`;
  const nameId = `${fieldId}-name`;
  const descriptionId = `${fieldId}-description`;

  const { errors, isDirty } = form.formState;

  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  const trimmedName = name.trim();
  const nameError =
    errors.name?.message ??
    (isNameTaken ? `A folder named “${trimmedName}” already exists.` : null);
  const canSave = isDirty && trimmedName !== "" && !nameError && !errors.description && !isSaving;

  const handleSubmit = form.handleSubmit(async (values) => {
    if (isNameTaken) return;
    setSubmitError(null);

    try {
      const { data: savedFolder } = await saveFolder({
        id: folder?.id,
        name: values.name,
        description: values.description,
        color: values.color,
      });

      if (agentToMove) {
        moveFlow({
          flowId: agentToMove.id,
          flowName: agentToMove.name,
          folder: { id: savedFolder.id, name: savedFolder.name },
        });
      } else {
        toast.success(isEditing ? "Folder updated" : `Created folder ${savedFolder.name}`, {
          className: "sonner-toaster-sm",
        });
      }
      onCloseConfirmed();
    } catch (error) {
      setSubmitError(getMutationErrorMessage(error));
    }
  });

  const status = submitError ? (
    <StatusLine tone="error">{submitError}</StatusLine>
  ) : isEditing ? (
    <StatusLine tone={isDirty ? "pending" : "idle"}>
      {isDirty ? "Unsaved changes" : "No changes yet"}
    </StatusLine>
  ) : (
    <StatusLine tone="idle">Shared with everyone in {spaceName}</StatusLine>
  );

  return (
    <CardDialog
      isOpen={isOpen}
      onClose={onClose}
      isDismissLocked={isSaving}
      isOutsideClickLocked={isDirty}
      mark={<FolderMark color={color} size="lg" />}
      eyebrow={isEditing ? "Edit folder" : "New folder"}
      title={
        <span className={cn(!trimmedName && "text-muted-foreground")}>
          {trimmedName || (isEditing ? folder?.name : "Untitled folder")}
        </span>
      }
      footer={
        <>
          {status}
          <div className="flex shrink-0 items-center gap-2">
            <CardDialogButton onClick={onClose} disabled={isSaving}>
              Cancel
            </CardDialogButton>
            <CardDialogButton
              type="submit"
              form={formId}
              variant="primary"
              disabled={!canSave}
              isBusy={isSaving}
            >
              {isSaving
                ? "Saving"
                : isEditing
                  ? "Save changes"
                  : agentToMove
                    ? "Create and move"
                    : "Create folder"}
            </CardDialogButton>
          </div>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField
          htmlFor={nameId}
          label="Name"
          length={name.length}
          maxLength={FOLDER_NAME_MAX_LENGTH}
          error={nameError}
        >
          <div className="relative">
            <FolderGlyph
              className={cn(
                "pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 transition-colors",
                trimmedName ? color.glyph : "text-muted-foreground",
              )}
            />
            <input
              id={nameId}
              data-autofocus
              autoComplete="off"
              maxLength={FOLDER_NAME_MAX_LENGTH}
              placeholder="e.g. Finance automations"
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? `${nameId}-error` : undefined}
              {...form.register("name")}
              className={cn(getFieldInputClassName(Boolean(nameError)), "h-11 pl-10")}
            />
          </div>
        </FormField>

        <FolderColorPicker selectedColor={color} registration={form.register("color")} />

        <FormField
          htmlFor={descriptionId}
          label="Description"
          isOptional
          length={description.length}
          maxLength={FOLDER_DESCRIPTION_MAX_LENGTH}
          error={errors.description?.message}
        >
          <textarea
            id={descriptionId}
            rows={3}
            maxLength={FOLDER_DESCRIPTION_MAX_LENGTH}
            placeholder="What belongs in this folder?"
            aria-invalid={Boolean(errors.description)}
            {...form.register("description")}
            className={cn(
              getFieldInputClassName(Boolean(errors.description)),
              "block resize-none py-2.5 leading-5",
            )}
          />
        </FormField>

        {agentToMove && (
          <AgentToMoveCallout agent={agentToMove} folderName={trimmedName} folderColor={color} />
        )}

        <p className="flex gap-2 text-[12px] leading-5 text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
          Folders only organize the list. Moving an agent into a folder doesn’t change who can see
          or edit it.
        </p>
      </form>
    </CardDialog>
  );
};
