import { buttonVariants } from "@avplatform/ui/buttons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@avplatform/ui/dropdown-menu";
import { cn } from "@avplatform/ui/lib";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { UserMinus2Icon } from "lucide-react";

import { UiBuilderUserDto } from "../../dtos/ui-builder-users-dto";
import { useRemoveUiBuilderUserMutation } from "../../hooks/useRemoveUiBuilderUserMutation";

interface UiBuilderUsersListItemActionsProps {
  item: UiBuilderUserDto;
  uiBuilderProjectId: string;
}

export const UiBuilderUsersListItemActions = ({
  item,
  uiBuilderProjectId,
}: UiBuilderUsersListItemActionsProps) => {
  const { mutate: removeUser } = useRemoveUiBuilderUserMutation(uiBuilderProjectId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon7" }),
          "hover:bg-slate-200",
          "data-[state=open]:bg-slate-200 data-[state=open]:opacity-100",
        )}
      >
        <EllipsisHorizontalIcon className="h-4 w-4 text-[--icon-color]" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[8rem] min-w-[8rem]">
        <DropdownMenuItem
          className={cn(
            buttonVariants({ variant: "dropdownCautionItem" }),
            "group h-7 !px-[0.3rem] text-xs",
          )}
          onClick={() => {
            if (item.id) removeUser(item.id);
          }}
        >
          <UserMinus2Icon
            className={cn("mb-[2px] text-destructive group-focus:text-white", "h-3.5 w-3.5")}
          />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
