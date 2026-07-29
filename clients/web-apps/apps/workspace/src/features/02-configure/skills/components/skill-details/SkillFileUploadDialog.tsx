import { Dialog, DialogContent, DialogDefaultHeader } from "@avplatform/ui/dialog";
import { useShallow } from "zustand/react/shallow";

import { useSkillFilesDialogStore } from "../../stores/skill-files-upload-dialog-store";
import { SkillAddFileForm } from "./SkillAddFileForm";

export const SkillFileUploadDialog = ({
  skillId,
  skillName,
}: {
  skillId: string;
  skillName: string;
}) => {
  // Get dialog store state
  const { showDialog, setShowDialog } = useSkillFilesDialogStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
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
        <DialogDefaultHeader heading="Add File" className="p-3 px-4" />
        <div className="flex-1 overflow-hidden">
          <SkillAddFileForm skillId={skillId} skillName={skillName} onCompleted={handleComplete} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
