import { useQuery } from "@tanstack/react-query";

import { searchWorkspaceUsers } from "../apis/notification-apis";

/**
 * Fetches workspace users within the current tenant matching the given search key.
 */
const useSearchWorkspaceUsers = (searchKey: string, enabled = false) => {
  return useQuery({
    queryKey: ["notification-recipient-users", searchKey],
    queryFn: () => searchWorkspaceUsers(searchKey, true),
    enabled: enabled && !!searchKey,
  });
};

export { useSearchWorkspaceUsers };
