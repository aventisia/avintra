import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import React from "react";
import { useShallow } from "zustand/react/shallow";
import { SimpleDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/SimpleDDMenuItem";
import { MonitorCheck } from "lucide-react";
import { useAgentsTableStore } from "../stores/agents-table-store";
import { useFetchMachines } from "../hooks/useFetchMachines";

interface DTEditRowActionProps {
  rowId: string;
  size?: "sm" | "md";
}

export const AssignMachineRowAction: React.FC<DTEditRowActionProps> = ({
  rowId,
  size = "md",
}) => {
  // Get store state and actions
  const { setCrudDialogOptions } = useDTCrudDialogStore(
    useShallow((state) => ({
      setCrudDialogOptions: state.setCrudDialogOptions,
    })),
  );

  const { data, isFetching } = useFetchMachines(rowId);

  // Get store state and actions
  const {
    setCurrentAgentMachines,
    setAllAssigned,
    setFetchinCurrentAgentMachines,
  } = useAgentsTableStore(
    useShallow((state) => ({
      setCurrentAgentMachines: state.setCurrentAgentMachines,
      setAllAssigned: state.setAllAssigned,
      setFetchinCurrentAgentMachines: state.setFetchinCurrentAgentMachines,
    })),
  );

  // Return the Edit or View dropdown menu item
  return (
    <SimpleDDMenuItem
      size={size}
      content="Assign Machine"
      Icon={MonitorCheck}
      onClick={() => {
        setCrudDialogOptions({
          showDialog: true,
          rowId,
          crudAction: "update",
        });
        setFetchinCurrentAgentMachines(isFetching);
        setCurrentAgentMachines(data?.data ?? []);
        if (data?.data)
          setAllAssigned(
            data?.data.some((x) => x.isAssigned)
              ? "indeterminate"
              : data?.data.every((x) => x.isAssigned),
          );
      }}
    />
  );
};
