import { formatDistanceToNow } from "date-fns";
import { Label } from "@/react-toolkit/ui/label";
import { AssignAgentDto } from "../../dtos/assign-agent-dto";
import { Checkbox } from "@/react-toolkit/ui/checkbox";
import { Badge } from "@/react-toolkit/ui/badge";

type AgentCheckListItemProps = {
  onCheckedChange(checked: boolean): void;
} & AssignAgentDto;

export const AgentCheckListItem = (props: Partial<AgentCheckListItemProps>) => {
  return (
    <Label key={props.id} htmlFor={props.id}>
      <div className="my-2 me-1 flex items-center justify-between rounded-sm border py-1 hover:bg-slate-100">
        <div className="ms-2 flex items-center justify-between space-x-4">
          <Checkbox
            checked={props.isAssigned}
            onCheckedChange={props.onCheckedChange}
            id={props.id}
          />
          <div className="flex flex-col space-y-3 p-2">
            <p className="text-md space-x-2 self-start">
              <span className="text-base">{props.name}</span>
              <Badge>{"v" + props.versionNumber}</Badge>
            </p>
            <div className="text-xs font-normal leading-snug text-muted-foreground">
              {`published by ${props.lastModifiedBy} ${formatDistanceToNow(props.lastModifiedOn ?? new Date())} ago`}
            </div>
          </div>
        </div>
      </div>
    </Label>
  );
};
