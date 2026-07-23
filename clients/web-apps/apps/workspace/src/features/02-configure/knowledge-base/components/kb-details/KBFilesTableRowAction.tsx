import { Button } from "@avplatform/ui/buttons";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, Trash2Icon } from "lucide-react";

import {
  deleteKnowledgeBaseFile,
  deleteVectorStoreDocument,
} from "../../apis/knowledge-base-file-apis";
import { DETAIL_DATA_QUERY_KEY } from "../../constants";
import { KnowledgeBaseFileDto } from "../../dtos/kb-file-dto";
import { KnowledgeBaseTableDto } from "../../dtos/knowledge-base-table-dto";

interface KBFilesTableRowActionProps {
  row: KnowledgeBaseFileDto;
  knowledgeBaseId: string;
  knowledgeBase?: KnowledgeBaseTableDto;
}

export const KBFilesTableRowAction = ({
  row,
  knowledgeBaseId,
  knowledgeBase,
}: KBFilesTableRowActionProps) => {
  const queryClient = useQueryClient();
  const { showCustomAlertDialog } = useShowAlertHandler();

  const { mutate: deleteFile, isPending } = useMutation({
    mutationFn: async () => {
      if (!knowledgeBase) {
        throw new Error("Knowledge base configuration is not available");
      }

      await deleteVectorStoreDocument({
        vector_store: knowledgeBase.vectorStore,
        doc_names: [row.fileName],
        kb_names: [knowledgeBase.name],
        store_credential_id: knowledgeBase.storeCredentialId,
      });

      await deleteKnowledgeBaseFile(knowledgeBaseId, row.id);
    },
    onSuccess: () => {
      toast.success("File deleted successfully");
      queryClient.invalidateQueries({
        queryKey: [...DETAIL_DATA_QUERY_KEY, knowledgeBaseId],
      });
    },
    onError: (error) => {
      toast.error((error as Error).message || "Failed to delete file");
    },
  });

  return (
    <Button
      onClick={() => {
        showCustomAlertDialog({
          confirmActionFn: () => deleteFile(),
          confirmBtnText: "Yes, delete",
          title: "Delete file?",
          description: "Are you sure you want to delete this file from the knowledge base?",
        });
      }}
      variant="caution"
      size="icon7"
      disabled={isPending}
    >
      {isPending ? (
        <Loader2Icon className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2Icon className="h-4 w-4" />
      )}
    </Button>
  );
};
