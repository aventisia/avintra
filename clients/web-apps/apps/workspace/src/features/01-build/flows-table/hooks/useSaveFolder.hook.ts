import { IHttpResponse } from "@avplatform/ui/dtos";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createFolder, updateFolder } from "../apis/folders-table.apis";
import { FOLDERS_QUERY_KEY } from "../constants";
import { FoldersTableRowDto } from "../dtos/folders-table-row.dto";
import { useCurrentSpaceId } from "./useCurrentSpaceId.hook";

type SaveFolderVariables = {
  /** Existing folder id, or nothing to create a folder. */
  id?: string;
  name: string;
  description: string;
  color: string;
};

type FoldersQueryData = IHttpResponse<FoldersTableRowDto[]>;

const upsertFolder = (folders: FoldersTableRowDto[], savedFolder: FoldersTableRowDto) =>
  folders.some((folder) => folder.id === savedFolder.id)
    ? folders.map((folder) => (folder.id === savedFolder.id ? savedFolder : folder))
    : [...folders, savedFolder];

/**
 * Creates or updates a folder once the server confirms it, so a new folder appears with its real id.
 */
export const useSaveFolder = () => {
  const queryClient = useQueryClient();
  const space = useCurrentSpaceId();
  const queryKey = [...FOLDERS_QUERY_KEY, space];

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ id, name, description, color }: SaveFolderVariables) =>
      id
        ? updateFolder({ id, name, description, color })
        : createFolder({ name, description, color }),
    onSuccess: ({ data: savedFolder }) => {
      queryClient.setQueryData<FoldersQueryData>(queryKey, (old) =>
        old?.data ? { ...old, data: upsertFolder(old.data, savedFolder) } : old,
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: FOLDERS_QUERY_KEY }),
  });

  return { saveFolder: mutateAsync, isSaving: isPending };
};
