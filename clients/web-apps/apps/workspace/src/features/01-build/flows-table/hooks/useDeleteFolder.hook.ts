import { toast } from "@avplatform/ui/sonner";
import { getMutationErrorMessage } from "@avplatform/ui/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { pluralize } from "@/utils/pluralize.util";

import { deleteFolder } from "../apis/folders-table.apis";
import { FLOWS_QUERY_KEY, FOLDERS_QUERY_KEY } from "../constants";
import { FoldersTableRowDto } from "../dtos/folders-table-row.dto";

/**
 * Deletes a folder once confirmed. The lists refresh in the background so a folder page can
 * navigate away before its folder disappears.
 */
export const useDeleteFolder = () => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (folder: FoldersTableRowDto) => deleteFolder(folder.id),
    onSuccess: (_response, folder) => {
      const movedText =
        folder.flowCount > 0
          ? ` · ${folder.flowCount} ${pluralize(folder.flowCount, "agent")} moved to Agents`
          : "";
      toast.success(`Deleted ${folder.name}${movedText}`, { className: "sonner-toaster-sm" });
    },
    onError: (error) => toast.error(getMutationErrorMessage(error)),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FOLDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FLOWS_QUERY_KEY });
    },
  });

  return { deleteFolder: mutateAsync, isDeleting: isPending };
};
