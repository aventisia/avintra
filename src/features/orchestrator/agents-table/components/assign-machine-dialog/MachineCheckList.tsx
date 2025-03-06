import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/react-toolkit/ui/card/card";
import { Label } from "@/react-toolkit/ui/label";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { Checkbox } from "@/react-toolkit/ui/checkbox";
import { useFetchAgents } from "../../hooks/useFetchAgents";
import { useEffect, useState } from "react";
import { Badge } from "@/react-toolkit/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useAssignMachineStore } from "../../stores/assign-machine-store";
import { AssignMachineDto } from "../../dtos/assign-machine-dto";
import { useFetchMachines } from "../../hooks/useFetchMachines";
import { assignMachines } from "../../apis/agents-table-apis";

type MachineCheckListProps = {
  agentName: string;
  assignedCount: number;
};

export const MachineCheckList = ({
  agentName,
  assignedCount,
}: MachineCheckListProps) => {
  const { toggleFormDirty, setIsDialogOpen, agentId } = useAssignMachineStore(
    useShallow((state) => ({
      isFormDirty: state.isFormDirty,
      agentId: state.agentId,
      setIsDialogOpen: state.setIsDialogOpen,
      toggleFormDirty: state.toggleFormDirty,
    })),
  );

  const { data } = useFetchMachines(agentId);
  const { refetch: refetchAgents } = useFetchAgents();

  const [machines, setMachines] = useState<AssignMachineDto[]>();
  // Get showAlert handler
  const { showCustomAlertDialog } = useShowAlertHandler();

  useEffect(() => {
    setMachines(data?.data ?? []);
  }, [data?.data]);

  const handleAgentChange = (isAssigned: boolean, id: string) => {
    if (!machines) return;
    const updatedChecklist = machines.map((item) =>
      item.id === id ? { ...item, isAssigned } : item,
    );
    setMachines(updatedChecklist);
    toggleFormDirty(true);
  };

  // Handle "Select All" checkbox
  const handleSelectAll = (isAssigned: boolean) => {
    if (!machines) return;
    const updatedChecklist = machines.map((item) => ({
      ...item,
      isAssigned,
    }));
    setMachines(updatedChecklist);
    toggleFormDirty(true);
  };

  const isAllSelected = machines?.every((item) => item.isAssigned);
  const isSomeSelected = machines?.some((item) => item.isAssigned);
  const selectedCount = machines?.filter((item) => item.isAssigned).length;

  // Define mutation to update email of account
  const { mutate: mutateMachine } = useMutation({
    mutationFn: assignMachines,
    onSuccess: (data) => {
      toast.success(data.message);
      setIsDialogOpen(false);
      refetchAgents();
    },
    onError: (error) => {
      toast.error(error.toString());
      setIsDialogOpen(true);
    },
  });

  const handleAssignClick = () => {
    if (!machines) return;
    showCustomAlertDialog({
      confirmActionFn: () => {
        // assign selected agents
        mutateMachine({
          machineIds: machines
            .filter((agent) => agent.isAssigned)
            .map((a) => a.id),
          flowVersionId: agentId,
        });
      },
      isDestructive: false,
      title: "Are you sure to assign selected machine(s)?",
      description: `selected ${machines.filter((agent) => agent.isAssigned).length} machien(s) will be assigned to agent ${agentName}`,
      confirmBtnText: "Assign",
    });
  };

  return (
    <div className="flex flex-col">
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>
            <span className="flex">
              {"Machines "}
              <span className="text-md ms-auto text-muted-foreground">
                {"assigned: "}
                <Badge>{assignedCount}</Badge>
              </span>
            </span>
          </CardTitle>
          <CardDescription>
            <span className="flex">
              Select Machines's from list to assign to agent{" "}
              <span className="ms-1 font-semibold">{agentName} </span>
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex items-center justify-start space-x-4">
            <Checkbox
              onCheckedChange={handleSelectAll}
              checked={isAllSelected || (isSomeSelected && "indeterminate")}
              id="select-all-agents"
            />
            <Label htmlFor="select-all-agents">Select All</Label>
          </div>
          <ScrollArea className="h-60 rounded-sm border p-1">
            {machines?.map((agent) => (
              <div
                key={agent.id}
                className="my-2 flex w-fit items-center justify-between space-x-4 space-y-4 rounded-sm border py-1 hover:bg-slate-100"
              >
                <div className="ms-2 flex items-center justify-between space-x-4">
                  <Checkbox
                    checked={agent.isAssigned}
                    onCheckedChange={(isChecked: boolean) =>
                      handleAgentChange(isChecked, agent.id)
                    }
                    id={agent.id}
                  />
                  <Label htmlFor={agent.id} className="flex flex-col space-y-1">
                    <div className="flex flex-col space-y-2 p-2">
                      <div className="grid w-60 grid-cols-2 gap-4">
                        <p className="text-md self-start">{agent.name}</p>
                        <p className="ms-auto self-end text-primary">{`Linux`}</p>
                      </div>
                      <div className="text-xs font-normal leading-snug text-muted-foreground">
                        {`created by ${agent.createdBy} ${formatDistanceToNow(agent.createdOn)} ago`}
                        <div className="text-xs font-normal leading-snug text-muted-foreground">
                          {`last modified by ${agent.lastModifiedBy} ${formatDistanceToNow(agent.lastModifiedOn)} ago`}
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex items-end justify-end">
          <Button onClick={handleAssignClick}>
            Assign {` (${selectedCount})`}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
