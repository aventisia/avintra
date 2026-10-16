import { Button } from "@avplatform/ui/buttons";
import { Dialog, DialogContent, DialogDefaultHeader } from "@avplatform/ui/dialog";
import { useEffect, useState } from "react";

type UiBuilderEditTextDialogProps = {
  open: boolean;
  selector: string;
  initialText: string;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (newText: string) => void;
};

/** Dialog for rewording the selected element's text without an LLM call. */
export const UiBuilderEditTextDialog = ({
  open,
  selector,
  initialText,
  isSaving,
  onOpenChange,
  onConfirm,
}: UiBuilderEditTextDialogProps) => {
  const [text, setText] = useState(initialText);
  const [showBlankError, setShowBlankError] = useState(false);

  useEffect(() => {
    if (!open) return;
    setText(initialText);
    setShowBlankError(false);
  }, [open, initialText]);

  const handleConfirm = () => {
    if (!text.trim()) {
      setShowBlankError(true);
      return;
    }
    onConfirm(text);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="space-y-4 p-4">
        <DialogDefaultHeader heading="Edit text" description={selector} />

        <textarea
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            if (showBlankError) setShowBlankError(false);
          }}
          className="h-24 w-full resize-none rounded-md border border-slate-200 bg-white p-2 text-sm"
          disabled={isSaving}
        />

        {showBlankError && (
          <p className="text-2xs text-destructive">Enter some text before saving.</p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isSaving}>
            Save text
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
