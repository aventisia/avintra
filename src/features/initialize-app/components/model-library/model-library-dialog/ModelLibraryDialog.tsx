import { useModelLibraryDialogStore } from "@/features/initialize-app/store/model-library-dialog-store";
import { useUseTemplateMutation } from "@/features/save-as-template/hooks/useUseTemplate";

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

const ModelLibraryDialog = () => {
  const { isOpen, setOpen, templateToUse } = useModelLibraryDialogStore();

  const { mutateAsync, isPending } = useUseTemplateMutation();

  const handleuseTemplate = async () => {
    await mutateAsync(templateToUse);
    setOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="space-y-2 !max-w-[40rem] px-1">
        <DialogHeader className="flex-row items-start justify-between px-5 pt-5">
          <div className="flex items-center gap-3">
            <div className="bg-accent p-2 rounded-lg">
              <img src={"/brand-img/gemma.svg"} alt="" className="h-8 w-8" />
            </div>
            <div className="bg-accent p-2 rounded-lg">
              <img
                src={"/brand-img/deepseek-r1.svg"}
                alt=""
                className="h-8 w-8"
              />
            </div>
          </div>
          <Button
            variant={"ghost"}
            className="px-1"
            onClick={() => setOpen(false)}
            size={"icon9"}
          >
            <X className="h-6 w-6" />
          </Button>
        </DialogHeader>

        <div className="space-y-4 px-5">
          <h1 className="text-2xl font-bold">{templateToUse.name}</h1>
          <ScrollArea className="h-28">
            <p className="font-light text-md text-accent-foreground">
              {templateToUse.description || "No description available"}
            </p>
          </ScrollArea>
          <Badge className="bg-transparent text-primary border-primary text-xs px-4">
            {templateToUse.type}
          </Badge>
        </div>

        <DialogFooter className="flex-row !justify-between px-5 pt-4 pb-5">
          <div className="flex items-center gap-2 text-sm">
            <Badge className="!rounded-full h-8 w-8 !p-0 flex justify-center">
              {templateToUse?.createdBy &&
                templateToUse?.createdBy
                  .split(" ")
                  .map((word) => word[0])
                  .join("")}
            </Badge>
            <p>By {templateToUse.createdBy}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center text-muted-foreground text-sm">
              <Button variant={"ghost"} className="p-0  px-2">
                <Copy className="h-4 w-4" />
              </Button>
              <p>{templateToUse.usagesCount}</p>
            </div>
            <Button onClick={handleuseTemplate} className="min-w-36">
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

export default ModelLibraryDialog;
