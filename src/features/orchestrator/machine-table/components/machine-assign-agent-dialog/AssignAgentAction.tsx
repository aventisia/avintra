import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { DTSelectionInfo } from "@/react-toolkit/ui/data-table/bulk-actions/DTSelectionInfo";
import { Separator } from "@/react-toolkit/ui/separator";
import { Table } from "@tanstack/react-table";
import { SelectOptionDto } from "@/react-toolkit/dtos/response/select-option-dto";
import { assignAgents } from "../../apis/machine-apis";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Lucide from "@/react-toolkit/ui/Lucide";
import { useMachineAgentStore } from "../../store/machine-agent-store";
import { useShallow } from "zustand/react/shallow";

interface AssignAgentActionsProps {
  table: Table<SelectOptionDto>;
}

export function AssignAgentAction({
  table,
}: Readonly<AssignAgentActionsProps>) {
  // Get showAlert handler
  const { showCustomAlertDialog } = useShowAlertHandler();

  const { setShowDialog, machineId } = useMachineAgentStore(
    useShallow((state) => ({
      setShowDialog: state.setIsDialogOpen,
      machineId: state.machineId,
    })),
  );

  // Get rowIds of selected rows
  const selectedRowIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original.value)
    .filter((id): id is string => id !== undefined);

  // Define mutation to update email of account
  const { mutate: mutateMachine } = useMutation({
    mutationFn: assignAgents,
    onSuccess: (data) => {
      toast.success(data.message);
      setShowDialog(false);
    },
    onError: (error) => {
      toast.error(error.toString());
      setShowDialog(true);
    },
  });

  const handleAssignClick = () =>
    showCustomAlertDialog({
      confirmActionFn: () => {
        // assign selected agents
        mutateMachine({
          agentIds: selectedRowIds,
          machineId,
        });

        // Remove selection
        table.toggleAllRowsSelected(false);
      },
      isDestructive: false,
      title: "Are you sure to assign selected agent(s)?",
      description: `selected ${selectedRowIds.length} agent(s) will be assigned to machine`,
      confirmBtnText: "Assign",
    });

  return (
    <>
      {selectedRowIds.length > 0 && (
        <div className="fixed bottom-4 flex items-center justify-center gap-3 self-center rounded-lg border bg-white px-4 py-2 text-sm shadow-lg">
          <DTSelectionInfo table={table} />
          <Separator orientation="vertical" className="h-6 w-[0.5px]" />
          <button
            onClick={handleAssignClick}
            className="group flex gap-2 align-middle text-sm tracking-wide"
          >
            <Lucide
              icon="CheckCheck"
              className="text-primarys mb-[2px] h-4 w-4 group-hover:text-white group-focus:text-white"
            />
            Assign
          </button>
        </div>
      )}
    </>
  );
}
