import { LoadingSpinner } from "@aventisia/ui";
import { Badge } from "@aventisia/ui/badge";
import { Button } from "@aventisia/ui/buttons";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@aventisia/ui/dialog";
import { ScrollArea } from "@aventisia/ui/scroll";
import { Copy, X } from "lucide-react";

import { useAgentTemplateMutation } from "../hooks/useAgentTemplateMutation";
import { useModelTemplateMutation } from "../hooks/useModelTemplateMutation";
import { useWorcLibraryDialogStore } from "../stores/worc-library-store";

/**
 * TemplateDialog
 *
 * Dialog to preview and apply a selected Worc template (agent or model).
 * Handles dynamic mutation based on template type, shows loading state, and
 * allows user interaction like copying usage count or viewing details.
 */
const TemplateDialog = () => {
  const { isOpen, setOpen, templateToUse } = useWorcLibraryDialogStore();

  // Initialize mutations for model and agent templates
  const { mutateAsync: modelMutation, isPending: isPendingModel } =
    useModelTemplateMutation();
  const { mutateAsync: agentMutation, isPending: isPendingAgent } =
    useAgentTemplateMutation();

  // Determine type of template
  const isModelTemplate = templateToUse?.type === "Inferencing";
  const isAgentTemplate = ["Agent", "Block"].includes(templateToUse?.type);

  // Track loading state based on active mutation
  const isPending = isModelTemplate
    ? isPendingModel
    : isAgentTemplate
      ? isPendingAgent
      : false;

  // Handles the action to apply the selected template
  const handleUseTemplate = async () => {
    try {
      if (isModelTemplate) {
        await modelMutation(templateToUse);
      } else if (isAgentTemplate) {
        await agentMutation(templateToUse);
      }
      setOpen(false); // Close dialog on success
    } catch (error) {
      // Mutation error is already handled by hooks
      console.log(error);
    }
  };

  // Do not render if no template is selected
  if (!templateToUse) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="!max-w-[40rem] space-y-2 px-1">
        {/* Header with icons and close button */}
        <DialogHeader className="flex-row items-start justify-between px-5 pt-5">
          <div className="flex items-center gap-3">
            {templateToUse.icons && templateToUse.icons.length > 0 ? (
              templateToUse.icons.map((imgPath, idx) => (
                <div key={idx} className="rounded-lg bg-accent p-2">
                  <img src={imgPath} alt="" className="h-8 w-8" />
                </div>
              ))
            ) : (
              <div className="rounded-lg bg-accent p-2">
                <img src={""} alt="" className="h-8 w-8" />
              </div>
            )}
          </div>
          <Button variant="ghost" onClick={() => setOpen(false)} size="icon8">
            <X className="h-5 w-5 text-[--icon-color]" />
          </Button>
        </DialogHeader>

        {/* Template content */}
        <div className="space-y-4 px-5">
          <h1 className="text-2xl font-bold capitalize">
            {templateToUse.name}
          </h1>

          <ScrollArea className="h-28">
            <p className="text-md font-light text-accent-foreground">
              {templateToUse.description || "No description available"}
            </p>
          </ScrollArea>

          <Badge className="border-primary-600 bg-transparent px-4 text-xs text-primary-600">
            {templateToUse.type}
          </Badge>
        </div>

        {/* Footer with creator, usage count, and action button */}
        <DialogFooter className="flex-row !justify-between px-5 pb-5 pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Badge className="flex h-8 w-8 justify-center !rounded-full bg-primary-500 !p-0">
              {templateToUse.createdBy
                ?.split(" ")
                .map((word) => word[0])
                .join("")}
            </Badge>
            <p>By {templateToUse.createdBy}</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Copy usage count to clipboard */}
            <div className="flex items-center text-sm text-muted-foreground">
              <Button
                variant="ghost"
                className="p-0 px-2"
                onClick={() => {
                  navigator.clipboard.writeText(`${templateToUse.usagesCount}`);
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <p>{templateToUse.usagesCount}</p>
            </div>

            {/* Apply template */}
            <Button
              onClick={handleUseTemplate}
              className="min-w-36"
              disabled={isPending}
            >
              {isPending ? (
                <LoadingSpinner className="h-6 w-6" />
              ) : (
                "Use this Template"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateDialog;
