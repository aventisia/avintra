import { type IHttpResponse } from "@avplatform/ui/dtos";
import { toast } from "@avplatform/ui/sonner";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { getMutationErrorMessage } from "@avplatform/ui/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { ROLE_OM, ROLE_TA } from "@/constants/roles";

import { setToolEnabledState } from "../apis/tools.apis";
import { DATA_QUERY_KEY, DETAIL_DATA_QUERY_KEY } from "../constants/tools-table.constants";
import { ToolDto } from "../dtos/index";

type ToggleLibraryToolPayload = {
  id: string;
  isEnabled: boolean;
};

/**
 * Switches a library tool on or off for the current tenant, updating the list
 * optimistically. Only tenant-admins and orchestrator-managers may toggle.
 */
export const useToggleLibraryTool = () => {
  const queryClient = useQueryClient();
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const roles = userSession?.userRoles ?? [];
  const canToggle = roles.includes(ROLE_TA) || roles.includes(ROLE_OM);

  const { mutate: toggle } = useMutation({
    mutationFn: ({ id, isEnabled }: ToggleLibraryToolPayload) => setToolEnabledState(id, isEnabled),
    onMutate: async ({ id, isEnabled }) => {
      await queryClient.cancelQueries({ queryKey: DATA_QUERY_KEY });

      const previousLists = queryClient.getQueriesData<IHttpResponse<ToolDto[]>>({
        queryKey: DATA_QUERY_KEY,
      });

      queryClient.setQueriesData<IHttpResponse<ToolDto[]>>({ queryKey: DATA_QUERY_KEY }, (old) =>
        old
          ? {
              ...old,
              data: old.data.map((tool) =>
                tool.id === id ? { ...tool, isActive: isEnabled } : tool,
              ),
            }
          : old,
      );

      return { previousLists };
    },
    onError: (error, _payload, context) => {
      context?.previousLists.forEach(([queryKey, data]) =>
        queryClient.setQueryData(queryKey, data),
      );
      toast.error(getMutationErrorMessage(error));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: DATA_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DETAIL_DATA_QUERY_KEY });
    },
  });

  return { canToggle, toggle };
};
