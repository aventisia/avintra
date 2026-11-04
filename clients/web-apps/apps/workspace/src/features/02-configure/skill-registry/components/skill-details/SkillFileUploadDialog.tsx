import { useShallow } from "zustand/react/shallow";

import { useSkillFilesDialogStore } from "../../stores/skill-files-upload-dialog.store";
import { SkillAddFileForm } from "./SkillAddFileForm";

export const SkillFileUploadDialog = ({
  skillId,
  skillName,
}: {
  skillId: string;
  skillName: string;
}) => {
  const { showDialog, setShowDialog } = useSkillFilesDialogStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
    })),
  );

  if (!showDialog) return null;

  return (
    <SkillAddFileForm
      skillId={skillId}
      skillName={skillName}
      onCompleted={() => setShowDialog(false)}
    />
  );
};
