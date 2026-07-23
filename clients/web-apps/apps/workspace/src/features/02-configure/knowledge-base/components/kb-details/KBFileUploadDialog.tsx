import { Dialog, DialogContent, DialogDefaultHeader } from "@avplatform/ui/dialog";
import { useShallow } from "zustand/react/shallow";

import { KnowledgeBaseTableDto } from "../../dtos/knowledge-base-table-dto";
import { useKBFilesDialogStore } from "../../stores/kb-files-upload-dialog-store";
import { KBAddFileForm } from "./KBAddFileForm";
import { KBAddTextForm } from "./KBAddTextForm";

export const KBFileUploadDialog = ({
  knowledgeBaseId,
  knowledgeBaseName,
  knowledgeBase,
}: {
  knowledgeBaseId: string;
  knowledgeBaseName: string;
  knowledgeBase?: KnowledgeBaseTableDto;
}) => {
  // Get crud dialog store state
  const { showDialog, setShowDialog, type } = useKBFilesDialogStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
      type: state.type,
    })),
  );

  const handleOpenChange = (open: boolean) => {
    setShowDialog(open);
  };

  const handleComplete = () => {
    handleOpenChange(false);
  };

  // Return dialog
  return (
    <Dialog open={showDialog} onOpenChange={handleOpenChange}>
      <DialogContent
        side={"center"}
        className="!max-w-3xl h-[40rem] flex flex-col p-0 overflow-hidden"
      >
        <DialogDefaultHeader
          heading={type == "text" ? "Raw Text Input" : "Add File"}
          className="p-3 px-4"
        />
        <div className="flex-1 overflow-hidden">
          {type == "text" ? (
            <KBAddTextForm
              knowledgeBaseId={knowledgeBaseId}
              knowledgeBaseName={knowledgeBaseName}
              knowledgeBase={knowledgeBase}
              onCompleted={handleComplete}
            />
          ) : (
            <KBAddFileForm
              knowledgeBaseId={knowledgeBaseId}
              knowledgeBaseName={knowledgeBaseName}
              knowledgeBase={knowledgeBase}
              onCompleted={handleComplete}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
