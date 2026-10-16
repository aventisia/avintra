import { buttonVariants } from "@avplatform/ui/buttons";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "@avplatform/ui/dropdown-menu";
import { cn } from "@avplatform/ui/lib";
import { UserMinus2Icon } from "lucide-react";

import { PublishedUiUserDto } from "../../dtos/published-ui-dto";
import { useRemovePublishedUiUser } from "../../hooks/useRemovePublishedUiUser.hook";
import { UsersActionsTrigger } from "../assign-users/assign-user-item-actions/UsersActionsTrigger";

interface UiBuilderUsersListItemActionsProps {
  item: PublishedUiUserDto;
}

export const UiBuilderUsersListItemActions = ({ item }: UiBuilderUsersListItemActionsProps) => {
  const { mutate: removeUser } = useRemovePublishedUiUser();

  return (
    <DropdownMenu>
      <UsersActionsTrigger />
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
