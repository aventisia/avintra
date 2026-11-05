import { useQuery } from "@tanstack/react-query";

import {
  getLandingActiveConversations,
  getLandingArchivedConversations,
} from "../apis/workspace-chat.apis";

/** Query key root for both landing conversation lists. */
export const LANDING_CONVERSATIONS_KEY = ["landing-conversations"] as const;

/**
 * Fetches the current user's active and archived landing conversations.
 */
export const useLandingConversations = () => {
  const active = useQuery({
    queryKey: [...LANDING_CONVERSATIONS_KEY, "active"],
    queryFn: getLandingActiveConversations,
  });

  const archived = useQuery({
    queryKey: [...LANDING_CONVERSATIONS_KEY, "archived"],
    queryFn: getLandingArchivedConversations,
  });

  return { active, archived };
};
