import { Textarea } from "@avplatform/ui";
import { Button, SubmitButton } from "@avplatform/ui/buttons";
import { Dialog, DialogContent, DialogTitle } from "@avplatform/ui/dialog";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { type UserChatProfileDto } from "../dtos/user-chat-profile.dto";
import { useUserChatProfile } from "../hooks/useUserChatProfile.hook";

const INSTRUCTIONS_LIMIT = 1500;
const MEMORY_LIMIT = 4000;

type HomeChatPreferencesFormProps = {
  initial: UserChatProfileDto;
  onClose: () => void;
};

const HomeChatPreferencesForm = ({ initial, onClose }: HomeChatPreferencesFormProps) => {
  const { save } = useUserChatProfile();
  const [customInstructions, setCustomInstructions] = useState(initial.customInstructions);
  const [memoryNotes, setMemoryNotes] = useState(initial.memoryNotes);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await save.mutateAsync({ customInstructions, memoryNotes });
      toast.success("Chat preferences saved");
      onClose();
    } catch {
      toast.error("Couldn't save your chat preferences");
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="home-chat-instructions" className="text-sm font-medium text-ink">
          Custom instructions
        </label>
        <p className="text-xs text-muted">
          How you want answers written, such as tone, length or format. Applies to every chat.
        </p>
        <Textarea
          id="home-chat-instructions"
          rows={4}
          maxLength={INSTRUCTIONS_LIMIT}
          value={customInstructions}
          onChange={(event) => setCustomInstructions(event.target.value)}
        />
        <span className="self-end text-xs text-muted">
          {customInstructions.length}/{INSTRUCTIONS_LIMIT}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="home-chat-memory" className="text-sm font-medium text-ink">
          Memory
        </label>
        <p className="text-xs text-muted">
          Facts the assistant should remember in every chat, one per line. You can edit them any
          time.
        </p>
        <Textarea
          id="home-chat-memory"
          rows={6}
          maxLength={MEMORY_LIMIT}
          value={memoryNotes}
          onChange={(event) => setMemoryNotes(event.target.value)}
        />
        <span className="self-end text-xs text-muted">
          {memoryNotes.length}/{MEMORY_LIMIT}
        </span>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <SubmitButton isPending={save.isPending}>Save</SubmitButton>
      </div>
    </form>
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} className="max-w-lg">
        <DialogTitle>Chat preferences</DialogTitle>
        {profile.isError && (
          <p className="text-sm text-danger">Couldn't load your chat preferences.</p>
        )}
        {profile.data && (
          <HomeChatPreferencesForm
            initial={profile.data.data}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
