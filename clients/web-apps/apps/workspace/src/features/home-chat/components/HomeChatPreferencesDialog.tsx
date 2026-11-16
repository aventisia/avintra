import { IconTile } from "@avplatform/ui/icon-tile";
import { cn } from "@avplatform/ui/lib";
import { toast } from "@avplatform/ui/sonner";
import { getMutationErrorMessage } from "@avplatform/ui/utils";
import { CircleNotchIcon, InfoIcon, SlidersHorizontalIcon } from "@phosphor-icons/react";
import { type FormEvent, useId, useState } from "react";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { FormField } from "@/components/card-dialog/FormField";
import { StatusLine } from "@/components/card-dialog/StatusLine";
import { getFieldInputClassName } from "@/components/card-dialog/field-input.util";

import { type UserChatProfileDto } from "../dtos/user-chat-profile.dto";
import { useUserChatProfile } from "../hooks/useUserChatProfile.hook";

const INSTRUCTIONS_LIMIT = 1500;
const MEMORY_LIMIT = 4000;
const EMPTY_PROFILE: UserChatProfileDto = { customInstructions: "", memoryNotes: "" };

const FieldHint = ({ children }: { children: string }) => (
  <span className="block pt-1.5 text-[12px] leading-5 text-muted-foreground">{children}</span>
);

type HomeChatPreferencesBodyProps = {
  initial: UserChatProfileDto;
  isLoading: boolean;
  loadError: boolean;
  onClose: () => void;
};

const HomeChatPreferencesBody = ({
  initial,
  isLoading,
  loadError,
  onClose,
}: HomeChatPreferencesBodyProps) => {
  const { save } = useUserChatProfile();
  const [customInstructions, setCustomInstructions] = useState(initial.customInstructions);
  const [memoryNotes, setMemoryNotes] = useState(initial.memoryNotes);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fieldId = useId();
  const formId = `${fieldId}-form`;
  const instructionsId = `${fieldId}-instructions`;
  const memoryId = `${fieldId}-memory`;

  const isSaving = save.isPending;
  const isDirty =
    customInstructions !== initial.customInstructions || memoryNotes !== initial.memoryNotes;
  const isUnavailable = isLoading || loadError;
  const canSave = isDirty && !isSaving && !isUnavailable;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSave) return;
    setSubmitError(null);
    try {
      await save.mutateAsync({ customInstructions, memoryNotes });
      toast.success("Chat preferences saved", { className: "sonner-toaster-sm" });
      onClose();
    } catch (error) {
      setSubmitError(getMutationErrorMessage(error));
    }
  };

  const status = loadError ? (
    <StatusLine tone="error">Couldn't load your chat preferences.</StatusLine>
  ) : submitError ? (
    <StatusLine tone="error">{submitError}</StatusLine>
  ) : (
    <StatusLine tone={isDirty ? "pending" : "idle"}>
      {isDirty ? "Unsaved changes" : "Applies to every chat"}
    </StatusLine>
  );

  return (
    <CardDialog
      isOpen
      onClose={onClose}
      isDismissLocked={isSaving}
      isOutsideClickLocked={isDirty}
      widthClassName="w-[min(34rem,calc(100vw-2rem))]"
      mark={<IconTile Icon={SlidersHorizontalIcon} size="xl" className="size-12 [&>svg]:size-6" />}
      eyebrow="Chat"
      title="Preferences"
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
              {isSaving ? "Saving" : "Save preferences"}
            </CardDialogButton>
          </div>
        </>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-[13px] text-muted-foreground">
          <CircleNotchIcon className="size-4 animate-spin" />
          Loading your preferences
        </div>
      ) : (
        <form id={formId} onSubmit={submit} noValidate className="space-y-4">
          <FormField
            htmlFor={instructionsId}
            label="Custom instructions"
            length={customInstructions.length}
            maxLength={INSTRUCTIONS_LIMIT}
            hint={
              <FieldHint>How you want answers written, such as tone, length or format.</FieldHint>
            }
          >
            <textarea
              id={instructionsId}
              data-autofocus
              rows={4}
              maxLength={INSTRUCTIONS_LIMIT}
              disabled={isUnavailable}
              placeholder="e.g. Keep answers short and use bullet points."
              value={customInstructions}
              onChange={(event) => setCustomInstructions(event.target.value)}
              className={cn(
                getFieldInputClassName(false),
                "block resize-none py-2.5 leading-5 disabled:opacity-60",
              )}
            />
          </FormField>

          <FormField
            htmlFor={memoryId}
            label="Memory"
            length={memoryNotes.length}
            maxLength={MEMORY_LIMIT}
            hint={<FieldHint>Facts the assistant should remember, one per line.</FieldHint>}
          >
            <textarea
              id={memoryId}
              rows={6}
              maxLength={MEMORY_LIMIT}
              disabled={isUnavailable}
              placeholder={"e.g. I work in the finance team.\nMy timezone is IST."}
              value={memoryNotes}
              onChange={(event) => setMemoryNotes(event.target.value)}
              className={cn(
                getFieldInputClassName(false),
                "block resize-none py-2.5 leading-5 disabled:opacity-60",
              )}
            />
          </FormField>

          <p className="flex gap-2 text-[12px] leading-5 text-muted-foreground">
            <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
            These apply to every chat. You can change them anytime.
          </p>
        </form>
      )}
    </CardDialog>
  );
};

type HomeChatPreferencesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Home's chat preferences: custom instructions and memory notes applied to every chat. */
export const HomeChatPreferencesDialog = ({
  open,
  onOpenChange,
}: HomeChatPreferencesDialogProps) => {
  const { profile } = useUserChatProfile();

  if (!open) return null;

  return (
    <HomeChatPreferencesBody
      key={profile.data ? "loaded" : "pending"}
      initial={profile.data?.data ?? EMPTY_PROFILE}
      isLoading={profile.isPending}
      loadError={profile.isError}
      onClose={() => onOpenChange(false)}
    />
  );
};
