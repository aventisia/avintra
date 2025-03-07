import { formatDistanceToNow } from "date-fns";
import { Label } from "@/react-toolkit/ui/label";
import { AssignAgentDto } from "../../dtos/assign-agent-dto";
import { Checkbox } from "@/react-toolkit/ui/checkbox";

type AgentCheckListItemProps = {
  onCheckedChange(checked: boolean): void;
} & AssignAgentDto;

export const AgentCheckListItem = (props: Partial<AgentCheckListItemProps>) => {
  return (
    <div
      key={props.id}
      className="my-2 flex w-fit items-center justify-between rounded-sm border py-1 hover:bg-slate-100"
    >
      <div className="ms-2 flex items-center justify-between space-x-4">
        <Checkbox
          checked={props.isAssigned}
          onCheckedChange={props.onCheckedChange}
          id={props.id}
        />
        <Label htmlFor={props.id} className="flex flex-col space-y-1 p-1">
          <div className="flex flex-col space-y-2 p-2">
            <div className="grid w-60 grid-cols-2 gap-4">
              <p className="self-start text-base">{props.name}</p>
              <p className="ms-auto self-end text-center text-primary">{`v${props.versionNumber}`}</p>
            </div>
            <div className="text-xs font-normal leading-snug text-muted-foreground">
              {`published by ${props.createdBy} ${formatDistanceToNow(props.lastModifiedOn ?? new Date())} ago`}
            </div>
          </div>
        </Label>
      </div>
    </div>
  );
};
