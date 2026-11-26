import { getMutationErrorMessage } from "@avplatform/ui/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createChatProjectFile,
  deleteChatProjectFile,
  getChatProjectFiles,
} from "../apis/chat-project.apis";
import { HOME_CHAT_PROJECT_FILES_QUERY_KEY } from "../constants/home-chat.constant";
import { checkProjectFile, readProjectFileText } from "../utils/project-file.util";

/** The text files attached to one project, with add (read in the browser as text) and remove. */
export const useChatProjectFiles = (projectId: string) => {
  const queryClient = useQueryClient();
  const queryKey = [...HOME_CHAT_PROJECT_FILES_QUERY_KEY, projectId];
  const query = useQuery({
    queryKey,
    queryFn: async () => (await getChatProjectFiles(projectId)).data,
  });
  const files = query.data ?? [];
  const refresh = () => queryClient.invalidateQueries({ queryKey });

  const add = useMutation({
    mutationFn: async (file: File) =>
      createChatProjectFile(projectId, {
        name: file.name,
        content: await readProjectFileText(file),
      }),
    onSuccess: refresh,
    onError: (error) => toast.error(getMutationErrorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: (fileId: string) => deleteChatProjectFile(projectId, fileId),
    onSuccess: refresh,
    onError: () => toast.error("Couldn't remove that file"),
  });

  return {
    files,
    isLoading: query.isPending,
    isError: query.isError,
    isAdding: add.isPending,
    usedBytes: files.reduce((sum, file) => sum + file.sizeBytes, 0),
    addFile: (file: File) => {
      const problem = checkProjectFile(file, files);
      if (problem) toast.error(problem);
      else add.mutate(file);
    },
    removeFile: (fileId: string) => remove.mutate(fileId),
  };
};
