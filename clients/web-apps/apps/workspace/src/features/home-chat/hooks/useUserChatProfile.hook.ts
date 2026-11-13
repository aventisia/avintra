import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getUserChatProfile, saveUserChatProfile } from "../apis/user-chat-profile.apis";

/** Query key for the signed-in user's chat preferences. */
export const USER_CHAT_PROFILE_QUERY_KEY = ["home-chat", "user-profile"] as const;

/** Loads and saves the signed-in user's custom instructions and memory notes. */
export const useUserChatProfile = () => {
  const queryClient = useQueryClient();
  const profile = useQuery({
    queryKey: USER_CHAT_PROFILE_QUERY_KEY,
    queryFn: getUserChatProfile,
  });
  const save = useMutation({
    mutationFn: saveUserChatProfile,
    onSuccess: (response) => queryClient.setQueryData(USER_CHAT_PROFILE_QUERY_KEY, response),
  });

  return { profile, save };
};
