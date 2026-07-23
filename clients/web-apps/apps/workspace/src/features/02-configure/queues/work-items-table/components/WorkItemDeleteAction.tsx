import { DeleteDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteQueuesWorkItem } from "../apis/work-items-table-apis";
import { DATA_QUERY_KEY } from "../constants";

interface WorkItemDeleteActionProps {
  rowId: string;
}

export const WorkItemDeleteAction = ({ rowId }: WorkItemDeleteActionProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const queryClient = useQueryClient();

  const { mutate: deleteWorkItem } = useMutation({
    mutationFn: deleteQueuesWorkItem,

    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: ["queues"] });
      queryClient.invalidateQueries({ queryKey: DATA_QUERY_KEY });
      toast.success(res.message);
    },

    onError: (error) => {
      toast.error(error.toString());
    },
  });

  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () => deleteWorkItem(rowId),
          alertType: "delete-record",
          additionalText: "work item",
        });
      }}
    />
  );
};
