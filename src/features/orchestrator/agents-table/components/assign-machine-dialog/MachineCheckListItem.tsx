import type { AssignMachineDto } from "../../dtos/assign-machine-dto";
import { formatDistanceToNow } from "date-fns";
import { Label } from "@/react-toolkit/ui/label";
import { Skeleton } from "@/react-toolkit/ui/skeleton";
import { Checkbox } from "@/react-toolkit/ui/checkbox";
import { Badge } from "@/react-toolkit/ui/badge";

type MachineCheckListItemProps = {
  onCheckedChange?(checked: boolean): void;
} & AssignMachineDto;

export const MachineCheckListItem = (
  props: Partial<MachineCheckListItemProps>,
) => {
  return (
    <Label key={props.id} htmlFor={props.id}>
      <div className="my-2 me-2 flex items-center justify-between rounded-sm border py-1 hover:bg-slate-100">
        <div className="ms-2 flex items-center justify-between space-x-4">
          <Checkbox
            checked={props.isAssigned}
            onCheckedChange={props.onCheckedChange}
            id={props.id}
          />
          <div className="flex flex-col space-y-3 p-2">
            <p className="text-md space-x-2 self-start">
              <span className="text-base">{props.name}</span>
              <Badge>{`Linux`}</Badge>
            </p>
            <div className="text-xs font-normal leading-snug text-muted-foreground">
              {`created by ${props.createdBy} ${formatDistanceToNow(props.createdOn ?? new Date())} ago`}
              <div className="text-xs font-normal leading-snug text-muted-foreground">
                {`last modified by ${props.lastModifiedBy} ${formatDistanceToNow(props.lastModifiedOn ?? new Date())} ago`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Label>
  );
};

export const MachineCheckListItemSkeleton = () => {
  return <Skeleton className="h-4"></Skeleton>;
};
