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
import { useFetchMachines } from "../../hooks/useFetchMachines";
import { AgentCheckListItem } from "./AgentCheckListItem";
import { Skeleton } from "@/react-toolkit/ui/skeleton";

type AgentsCheckListProps = {
  machineName: string;
  assignedCount: number;
};

export const AgentsCheckList = ({
  machineName,
  assignedCount,
}: AgentsCheckListProps) => {
  const { data, isFetching, isLoading } = useFetchAgents();
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
  }, [data?.data, machineId]);

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
          <ScrollArea className="h-80 rounded-sm border p-2">
            {isFetching || isLoading ? (
              <Skeleton className="my-2 me-1 flex h-20 rounded-sm border py-1" />
            ) : (
              agents?.map((agent) => (
                <AgentCheckListItem
                  {...{
                    ...agent,
                    onCheckedChange: (isAssigned) =>
                      handleAgentChange(isAssigned, agent.id),
                  }}
                />
              ))
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex items-end justify-end">
          <Button
            onClick={handleAssignClick}
            disabled={isFetching || isLoading}
          >
            {`Assign (${selectedCount})`}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
