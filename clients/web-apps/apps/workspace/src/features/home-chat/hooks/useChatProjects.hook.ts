import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createChatProject,
  deleteChatProject,
  getChatProjects,
  updateChatProject,
} from "../apis/chat-project.apis";
import {
  HOME_CHAT_HISTORY_QUERY_KEY,
  HOME_CHAT_PROJECTS_QUERY_KEY,
} from "../constants/home-chat.constant";
import { type ChatProjectDto } from "../dtos/chat-project.dto";

type ProjectUpdate = { id: string; name: string; instructions?: string };

/** The user's Home chat projects, plus creating one (handing back its id), renaming and deleting. */
export const useChatProjects = () => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: HOME_CHAT_PROJECTS_QUERY_KEY,
    queryFn: async () => (await getChatProjects()).data,
  });
  const create = useMutation({
    mutationFn: createChatProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: HOME_CHAT_PROJECTS_QUERY_KEY }),
    onError: () => toast.error("Couldn't create that project"),
  });

  const rename = useMutation({
    mutationFn: ({ id, name, instructions }: ProjectUpdate) =>
      updateChatProject(id, name, instructions),
    onMutate: async ({ id, name, instructions }) => {
      await queryClient.cancelQueries({ queryKey: HOME_CHAT_PROJECTS_QUERY_KEY });
      queryClient.setQueryData<ChatProjectDto[]>(HOME_CHAT_PROJECTS_QUERY_KEY, (projects) =>
        projects?.map((project) =>
          project.id === id
            ? { ...project, name, instructions: instructions ?? project.instructions }
            : project,
        ),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: HOME_CHAT_PROJECTS_QUERY_KEY }),
  });
  const remove = useMutation({
    mutationFn: deleteChatProject,
    onError: () => toast.error("Couldn't delete that project"),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: HOME_CHAT_PROJECTS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: HOME_CHAT_HISTORY_QUERY_KEY }),
      ]),
  });

  return {
    projects: query.data ?? [],
    createProject: (name: string, onCreated: (projectId: string) => void) =>
      create.mutate(name, { onSuccess: (response) => onCreated(response.data.id) }),
    renameProject: (id: string, name: string) =>
      rename.mutate({ id, name }, { onError: () => toast.error("Couldn't rename that project") }),
    updateProject: (update: ProjectUpdate) => rename.mutateAsync(update),
    deleteProject: (id: string) => remove.mutateAsync(id),
  };
};
