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
  const { showDialog, setShowDialog, type } = useKBFilesDialogStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
      type: state.type,
    })),
  );

  if (!showDialog) return null;

  const AddForm = type == "text" ? KBAddTextForm : KBAddFileForm;

  return (
    <AddForm
      knowledgeBaseId={knowledgeBaseId}
      knowledgeBaseName={knowledgeBaseName}
      knowledgeBase={knowledgeBase}
      onCompleted={() => setShowDialog(false)}
    />
  );
};
