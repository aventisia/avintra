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
import type { AssignAgentDto } from "../../dtos/assign-agent-dto";
import { useEffect, useState } from "react";
import { Badge } from "@/react-toolkit/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { assignAgents } from "../../apis/machine-apis";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { useMachineAgentStore } from "../../store/machine-agent-store";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useFetchMachines } from "../../hooks/useFetchMachines";

type AgentsCheckListProps = {
  machineName: string;
  assignedCount: number;
};

export const AgentsCheckList = ({
  machineName,
  assignedCount,
}: AgentsCheckListProps) => {
  const { data } = useFetchAgents();
  const { refetch: refetchMachines } = useFetchMachines();

  const [agents, setAgents] = useState<AssignAgentDto[]>();
  // Get showAlert handler
  const { showCustomAlertDialog } = useShowAlertHandler();

  const { toggleFormDirty, setIsDialogOpen, machineId } = useMachineAgentStore(
    useShallow((state) => ({
      isFormDirty: state.isFormDirty,
      machineId: state.machineId,
      setIsDialogOpen: state.setIsDialogOpen,
      toggleFormDirty: state.toggleFormDirty,
    })),
  );

  useEffect(() => {
    setAgents(data?.data);
  }, [data?.data]);

  const handleAgentChange = (isAssigned: boolean, id: string) => {
    if (!agents) return;
    const updatedChecklist = agents.map((item) =>
      item.id === id ? { ...item, isAssigned } : item,
    );
    setAgents(updatedChecklist);
    toggleFormDirty(true);
  };

  // Handle "Select All" checkbox
  const handleSelectAll = (isAssigned: boolean) => {
    if (!agents) return;
    const updatedChecklist = agents.map((item) => ({
      ...item,
      isAssigned,
    }));
    setAgents(updatedChecklist);
    toggleFormDirty(true);
  };

  const isAllSelected = agents?.every((item) => item.isAssigned);
  const isSomeSelected = agents?.some((item) => item.isAssigned);
  const selectedCount = agents?.filter((item) => item.isAssigned).length;

  // Define mutation to update email of account
  const { mutate: mutateMachine } = useMutation({
    mutationFn: assignAgents,
    onSuccess: (data) => {
      toast.success(data.message);
      setIsDialogOpen(false);
      refetchMachines();
    },
    onError: (error) => {
      toast.error(error.toString());
      setIsDialogOpen(true);
    },
  });

  const handleAssignClick = () => {
    if (!agents) return;
    showCustomAlertDialog({
      confirmActionFn: () => {
        // assign selected agents
        mutateMachine({
          agentIds: agents.filter((agent) => agent.isAssigned).map((a) => a.id),
          machineId,
        });
      },
      isDestructive: false,
      title: "Are you sure to assign selected agent(s)?",
      description: `selected ${agents.filter((agent) => agent.isAssigned).length} agent(s) will be assigned to machine`,
      confirmBtnText: "Assign",
    });
  };

  return (
    <div className="flex flex-col">
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>
            <span className="flex">
              {"Agents "}
              <span className="text-md ms-auto text-muted-foreground">
                {"assigned: "}
                <Badge>{assignedCount}</Badge>
              </span>
            </span>
          </CardTitle>
          <CardDescription>
            <span className="flex">
              Select Agent's from list to assign to machine{" "}
              <span className="ms-1 font-semibold">{machineName} </span>
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
            {agents?.map((agent) => (
              <div
                key={agent.id}
                className="my-2 flex items-center justify-between space-x-4 space-y-4 rounded-sm border py-1"
              >
                <div className="ms-2 flex items-center justify-between space-x-4">
                  <Checkbox
                    checked={agent.isAssigned}
                    onCheckedChange={(isChecked: boolean) =>
                      handleAgentChange(isChecked, agent.id)
                    }
                    id={agent.id}
                  />
                  <Label htmlFor={agent.id}>
                    <div className="grid grid-rows-3">
                      <div className="grid w-60 grid-cols-2 gap-4">
                        <p className="text-md self-start">{agent.name}</p>
                        <p className="ms-auto self-end text-primary">{`v ${agent.versionNumber}`}</p>
                      </div>
                      <div className="text-xs font-normal leading-snug text-muted-foreground">
                        {`created by ${agent.createdBy} ${formatDistanceToNow(agent.createdOn)} ago`}
                      </div>
                      <div className="text-xs font-normal leading-snug text-muted-foreground">
                        {`last modified by ${agent.lastModifiedBy} ${formatDistanceToNow(agent.lastModifiedOn)} ago`}
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
