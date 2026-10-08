import { useActionLock } from "@avplatform/ui/action-lock";
import { Button } from "@avplatform/ui/buttons";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, Trash2Icon } from "lucide-react";

import { deleteSkillFile } from "../../apis/skill-registry-file.apis";
import { DATA_QUERY_KEY, DETAIL_DATA_QUERY_KEY } from "../../constants";
import { SkillFileDto } from "../../dtos/skill-file.dto";
import { SkillTableDto } from "../../dtos/skill-table.dto";

interface SkillFilesTableRowActionProps {
  row: SkillFileDto;
  skillId: string;
  skill?: SkillTableDto;
}

export const SkillFilesTableRowAction = ({ row, skillId }: SkillFilesTableRowActionProps) => {
  const queryClient = useQueryClient();
  const { showCustomAlertDialog } = useShowAlertHandler();
  const { locked } = useActionLock();

  const { mutate: deleteFile, isPending } = useMutation({
    mutationFn: async () => {
      await deleteSkillFile(skillId, row.id);
    },
    onSuccess: () => {
      toast.success("File deleted successfully");
      queryClient.invalidateQueries({
        queryKey: [...DETAIL_DATA_QUERY_KEY, skillId],
      });
      queryClient.invalidateQueries({
        queryKey: DATA_QUERY_KEY,
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
          description: "Are you sure you want to delete this file from the skill?",
        });
      }}
      variant="caution"
      size="icon7"
      disabled={isPending || locked}
    >
      {isPending ? (
        <Loader2Icon className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2Icon className="h-4 w-4" />
      )}
    </Button>
  );
};
