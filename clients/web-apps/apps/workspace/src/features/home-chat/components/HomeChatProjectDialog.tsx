import { PROJECT_NAME_MAX_LENGTH, formatFileSize } from "@avplatform/chat";
import { IconTile } from "@avplatform/ui/icon-tile";
import { cn, getFieldInputClassName, getFieldTextareaClassName } from "@avplatform/ui/lib";
import { toast } from "@avplatform/ui/sonner";
import { getMutationErrorMessage } from "@avplatform/ui/utils";
import {
  CircleNotchIcon,
  FileTextIcon,
  FolderSimpleIcon,
  PlusIcon,
  XIcon,
} from "@phosphor-icons/react";
import { type ChangeEvent, type FormEvent, useId, useRef, useState } from "react";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { FormField } from "@/components/card-dialog/FormField";
import { StatusLine } from "@/components/card-dialog/StatusLine";

import {
  PROJECT_FILE_ACCEPT,
  PROJECT_INSTRUCTIONS_LIMIT,
  PROJECT_MAX_FILES,
  PROJECT_MAX_TOTAL_BYTES,
} from "../constants/project-file.constant";
import { type ChatProjectDto } from "../dtos/chat-project.dto";
import { useChatProjectFiles } from "../hooks/useChatProjectFiles.hook";
import { useChatProjects } from "../hooks/useChatProjects.hook";

const FieldHint = ({ children }: { children: string }) => (
  <span className="block pt-1.5 text-[12px] leading-5 text-muted-foreground">{children}</span>
);

const HomeChatProjectBody = ({
  project,
  onClose,
}: {
  project: ChatProjectDto;
  onClose: () => void;
}) => {
  const { updateProject } = useChatProjects();
  const { files, isLoading, isError, isAdding, usedBytes, addFile, removeFile } =
    useChatProjectFiles(project.id);
  const formId = useId();
  const nameId = useId();
  const instructionsId = useId();
  const fileInput = useRef<HTMLInputElement>(null);
  const initialInstructions = project.instructions ?? "";
  const [name, setName] = useState(project.name);
  const [instructions, setInstructions] = useState(initialInstructions);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isDirty = name !== project.name || instructions !== initialInstructions;
  const canSave = isDirty && name.trim().length > 0 && !isSaving;
  const isFull = files.length >= PROJECT_MAX_FILES;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSave) return;
    setIsSaving(true);
    setSubmitError(null);
    try {
      await updateProject({ id: project.id, name: name.trim(), instructions });
      toast.success("Project saved");
      onClose();
    } catch (error) {
      setSubmitError(getMutationErrorMessage(error));
      setIsSaving(false);
    }
  };

  const pickFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) addFile(file);
  };

  const status = submitError ? (
    <StatusLine tone="error">{submitError}</StatusLine>
  ) : (
    <StatusLine tone={isDirty ? "pending" : "idle"}>
      {isDirty ? "Unsaved changes" : "Applies to every chat in this project"}
    </StatusLine>
  );

  return (
    <CardDialog
      isOpen
      onClose={onClose}
      isDismissLocked={isSaving}
      isOutsideClickLocked={isDirty}
      widthClassName="w-[min(34rem,calc(100vw-2rem))]"
      mark={<IconTile Icon={FolderSimpleIcon} size="xl" className="size-12 [&>svg]:size-6" />}
      eyebrow="Project"
      title="Project settings"
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
              {isSaving ? "Saving" : "Save project"}
            </CardDialogButton>
          </div>
        </>
      }
    >
      <form id={formId} onSubmit={submit} noValidate className="space-y-4">
        <FormField
          htmlFor={nameId}
          label="Name"
          length={name.length}
          maxLength={PROJECT_NAME_MAX_LENGTH}
        >
          <input
            id={nameId}
            maxLength={PROJECT_NAME_MAX_LENGTH}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={getFieldInputClassName(false)}
          />
        </FormField>

        <FormField
          htmlFor={instructionsId}
          label="Instructions"
          length={instructions.length}
          maxLength={PROJECT_INSTRUCTIONS_LIMIT}
          hint={<FieldHint>How the assistant should work in this project's chats.</FieldHint>}
        >
          <textarea
            id={instructionsId}
            data-autofocus
            rows={5}
            maxLength={PROJECT_INSTRUCTIONS_LIMIT}
            placeholder="e.g. We are drafting the Q3 board report. Keep a formal tone."
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            className={getFieldTextareaClassName(false)}
          />
        </FormField>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <span className="text-[12.5px] font-semibold text-ink-2">Files</span>
            <span className="text-[12px] tabular-nums text-muted-foreground">
              {formatFileSize(usedBytes)} of {formatFileSize(PROJECT_MAX_TOTAL_BYTES)} ·{" "}
              {files.length} of {PROJECT_MAX_FILES} files
            </span>
          </div>
          {isLoading ? (
            <div className="flex items-center gap-2 py-3 text-[13px] text-muted-foreground">
              <CircleNotchIcon className="size-4 animate-spin" />
              Loading files
            </div>
          ) : isError ? (
            <p className="py-3 text-[13px] text-muted-foreground">Couldn't load the files.</p>
          ) : (
            <ul
              className={cn(
                "divide-y divide-line rounded-lg border border-line",
                !files.length && "hidden",
              )}
            >
              {files.map((file) => (
                <li key={file.id} className="flex items-center gap-2.5 px-3 py-2 text-[13px]">
                  <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate text-ink">{file.name}</span>
                  <span className="shrink-0 text-[12px] tabular-nums text-muted-foreground">
                    {formatFileSize(file.sizeBytes)}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${file.name}`}
                    onClick={() => removeFile(file.id)}
                    className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    <XIcon className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <input
            ref={fileInput}
            type="file"
            accept={PROJECT_FILE_ACCEPT}
            className="hidden"
            onChange={pickFile}
          />
          <CardDialogButton
            className="mt-2"
            onClick={() => fileInput.current?.click()}
            disabled={isFull || isAdding || isLoading}
            isBusy={isAdding}
          >
            {!isAdding && <PlusIcon className="size-4" />}
            Add file
          </CardDialogButton>
          <FieldHint>
            Text files only. Files are added and removed right away, and every chat in this project
            reads them in full.
          </FieldHint>
        </div>
      </form>
    </CardDialog>
  );
};

/** The Project settings dialog: a project's name, instructions and text files, used by every chat in it. */
export const HomeChatProjectDialog = ({
  projectId,
  onClose,
}: {
  projectId: string | null;
  onClose: () => void;
}) => {
  const { projects } = useChatProjects();
  const project = projects.find((item) => item.id === projectId);
  if (!project) return null;
  return <HomeChatProjectBody key={project.id} project={project} onClose={onClose} />;
};
