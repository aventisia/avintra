import type { AssignMachineDto } from "../../dtos/assign-machine-dto";
import { formatDistanceToNow } from "date-fns";
import { Label } from "@/react-toolkit/ui/label";
import { Skeleton } from "@/react-toolkit/ui/skeleton";
import { Checkbox } from "@/react-toolkit/ui/checkbox";

type MachineCheckListItemProps = {
  onCheckedChange?(checked: boolean): void;
} & AssignMachineDto;

export const MachineCheckListItem = (
  props: Partial<MachineCheckListItemProps>,
) => {
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
              <p className="text-md self-start">{props.name}</p>
              <p className="ms-auto self-end text-primary">{`Linux`}</p>
            </div>
            <div className="text-xs font-normal leading-snug text-muted-foreground">
              {`created by ${props.createdBy} ${formatDistanceToNow(props.createdOn ?? new Date())} ago`}
              <div className="text-xs font-normal leading-snug text-muted-foreground">
                {`last modified by ${props.lastModifiedBy} ${formatDistanceToNow(props.lastModifiedOn ?? new Date())} ago`}
              </div>
            </div>
          </div>
        </Label>
      </div>
    </div>
  );
};

export const MachineCheckListItemSkeleton = () => {
  return <Skeleton className="h-4"></Skeleton>;
};
