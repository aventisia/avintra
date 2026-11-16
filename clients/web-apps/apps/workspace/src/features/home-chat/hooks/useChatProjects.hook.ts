import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createChatProject, getChatProjects } from "../apis/chat-project.apis";
import { HOME_CHAT_PROJECTS_QUERY_KEY } from "../constants/home-chat.constant";

/** The user's Home chat projects, plus creating one and handing back its id. */
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

  return {
    projects: query.data ?? [],
    createProject: (name: string, onCreated: (projectId: string) => void) =>
      create.mutate(name, { onSuccess: (response) => onCreated(response.data.id) }),
  };
};
