import { IconTile } from "@avplatform/ui/icon-tile";
import { cn } from "@avplatform/ui/lib";
import { BooksIcon } from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState } from "react";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { StatusLine } from "@/components/card-dialog/StatusLine";

import { useDefineSATForm } from "../hooks/useDefineSATForm";
import { useDeleteTemplateMutation } from "../hooks/useDeleteTemplateMutation";
import { TemplateFormFields } from "./TemplateFormFields";
import { TemplateFormSkeleton } from "./TemplateFormSkeleton";

type SaveAsTemplateCardProps = {
  onClose: () => void;
};

/**
 * Save as template in the card dialog style. Submitting sends the template for approval; deleting
 * an existing template asks for confirmation in the same card, keeping unsaved edits.
 */
export const SaveAsTemplateCard = ({ onClose }: SaveAsTemplateCardProps) => {
  const {
    form,
    onSubmit,
    isLoading,
    isPending,
    isUpdatePending,
    status,
    viewMode,
    templateId,
    templateRemark,
    lastModifiedBy,
    validationStatus,
  } = useDefineSATForm();
  const { mutate: deleteTemplate, isPending: isDeleting } = useDeleteTemplateMutation();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const formId = `${useId()}-form`;

  const { isDirty } = form.formState;
  const trimmedName = (form.watch("name") ?? "").trim();
  const savedName = form.formState.defaultValues?.name?.trim() || trimmedName;
  const isSaving = isPending || isUpdatePending;
  const isBusy = isSaving || isDeleting;
  const canDelete = !viewMode && Boolean(templateId);
  const unapprovedItems = validationStatus.filter((item) => !item.isApprovedTemplate);

  useEffect(() => {
    if (isLoading || bodyRef.current?.contains(document.activeElement)) return;
    bodyRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, [isLoading]);

  const formFooter = (
    <>
      {isLoading ? (
        <span />
      ) : viewMode ? (
        <StatusLine tone="idle">View only</StatusLine>
      ) : isDirty ? (
        <StatusLine tone="pending">Unsaved changes</StatusLine>
      ) : (
        <StatusLine tone="idle">
          {templateId ? "Submitting sends it for review again" : "Submitting sends it for review"}
        </StatusLine>
      )}
      <div className="flex shrink-0 items-center gap-2">
        {canDelete && (
          <CardDialogButton
            onClick={() => setIsConfirmingDelete(true)}
            disabled={isBusy}
            className="text-bad hover:bg-bad/10 hover:text-bad"
          >
            Delete
          </CardDialogButton>
        )}
        <CardDialogButton onClick={onClose} disabled={isBusy}>
          {viewMode ? "Close" : "Cancel"}
        </CardDialogButton>
        {!viewMode && (
          <CardDialogButton
            type="submit"
            form={formId}
            variant="primary"
            disabled={isLoading || isBusy}
            isBusy={isSaving}
          >
            {isSaving ? "Submitting" : "Submit for approval"}
          </CardDialogButton>
        )}
      </div>
    </>
  );

  const deleteFooter = (
    <>
      <StatusLine tone="warning">The template can’t be restored</StatusLine>
      <div className="flex shrink-0 items-center gap-2">
        <CardDialogButton
          autoFocus
          onClick={() => setIsConfirmingDelete(false)}
          disabled={isDeleting}
        >
          Keep template
        </CardDialogButton>
        <CardDialogButton
          variant="danger"
          isBusy={isDeleting}
          onClick={() => templateId && deleteTemplate(templateId)}
        >
          {isDeleting ? "Deleting" : "Delete template"}
        </CardDialogButton>
      </div>
    </>
  );

  return (
    <CardDialog
      isOpen
      onClose={onClose}
      isDismissLocked={isBusy}
      isOutsideClickLocked={isDirty || isConfirmingDelete}
      widthClassName="w-[min(36rem,calc(100vw-2rem))]"
      mark={
        <IconTile
          Icon={BooksIcon}
          size="xl"
          className="size-12 rounded-lg text-primary-text [&>svg]:size-6"
        />
      }
      eyebrow={
        isConfirmingDelete
          ? "Delete template"
          : viewMode
            ? "Template"
            : templateId
              ? "Edit template"
              : "Save as template"
      }
      eyebrowClassName={isConfirmingDelete ? "text-bad" : undefined}
      title={
        isConfirmingDelete ? (
          savedName
        ) : (
          <span className={cn(!trimmedName && "text-muted-foreground")}>
            {trimmedName || "Untitled template"}
          </span>
        )
      }
      footer={isConfirmingDelete ? deleteFooter : formFooter}
    >
      {isConfirmingDelete && (
        <p className="text-[13px] leading-5 text-ink-2">
          <span className="font-semibold text-ink">{savedName}</span> is removed from the template
          library{status === "Pending" ? " and withdrawn from review" : ""}. This agent stays as it
          is, and you can save it as a template again later.
        </p>
      )}
      <div
        ref={bodyRef}
        hidden={isConfirmingDelete}
        {...(isSaving ? { inert: "" } : {})}
        aria-busy={isSaving || isLoading}
      >
        {isLoading ? (
          <TemplateFormSkeleton />
        ) : (
          <form id={formId} onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <TemplateFormFields
              form={form}
              isReadOnly={viewMode}
              status={status}
              remark={templateRemark}
              approvedBy={lastModifiedBy}
              unapprovedItems={unapprovedItems}
            />
          </form>
        )}
      </div>
    </CardDialog>
  );
};
