import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useCollaborationStore } from "../stores/collaboration-store";
import { getUniquePresenceUsers } from "../utils/get-unique-presence";

/**
 * Returns the number of unique users currently present in the flow, deduped by user
 * (email, falling back to userId) so a user with multiple connections counts once.
 * Used to hide collaboration affordances (presence avatars, live chat) until at
 * least one other user has joined.
 */
export const useCollaboratorCount = () => {
  const presence = useCollaborationStore(useShallow((state) => state.presence));

  return useMemo(() => getUniquePresenceUsers(presence).length, [presence]);
};
