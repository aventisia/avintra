import { NoContentMessage } from "@aventisia/ui";
import { Avatar, AvatarFallback } from "@aventisia/ui/avatar";
import {
  Command,
  CommandEmpty,
  // CommandInput,
  CommandItem,
  CommandList,
} from "@aventisia/ui/command";
import { cn } from "@aventisia/ui/lib";
// import { ScrollArea } from "@aventisia/ui/scroll";
import { BotIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useFetchChatAgentUsers } from "../../hooks/user/useFetchChatAgentUsers";
import { useAgentUsersStore } from "../../stores/agent-users-store";
import { UsersListItemActions } from "./assign-user-item-actions";

const UsersList = () => {
  const { flowVersionId } = useAgentUsersStore(
    useShallow((s) => ({
      flowVersionId: s.flowVersionId,
    })),
  );

  // Use to fetch users list of Queue
  const { data } = useFetchChatAgentUsers(flowVersionId);

  return (
    <Command>
      {/* <div className="my-1.5 rounded-lg bg-slate-100">
        <CommandInput
          className="h-9 text-xs"
          placeholder="Search..."
          autoFocus
        />
      </div> */}
      <CommandEmpty>
        <NoContentMessage
          // className="-mt-5"
          Icon={BotIcon}
          primaryMessage="No User found"
        />
      </CommandEmpty>
      {/* <ScrollArea> */}
        <CommandList>
          {data?.data?.map((val) => {
            return (
              <CommandItem
                key={val.id}
                value={`${val?.username}${val?.firstName}${val?.lastName}`}
                className="group/CommandItem cursor-pointer rounded-lg p-1"
              >
                <div
                  className={
                    "flex w-full items-center gap-3 rounded-lg px-0.5 py-0.5 pl-2"
                  }
                >
                  {/* Content container */}
                  <div className="flex grow items-center gap-2">
                    <Avatar className={cn("flex h-7 w-7")}>
                      <AvatarFallback className="bg-muted text-xs border font-medium capitalize tracking-wider text-secondary">
                        {val?.createdByUserInitials
                          ? val.createdByUserInitials
                          : "--"}
                      </AvatarFallback>
                    </Avatar>
                    {/* User name */}
                    <div className="flex flex-col">
                      <p>{`${val?.firstName} ${val?.lastName}`}</p>
                      <span className="text-2xs text-muted-foreground">
                        {val?.username}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* <span className="text-2xs text-muted-foreground">
                      {" "}
                      {val.accessType?.replace(/([A-Z])/g, " $1")}
                    </span> */}
                    <UsersListItemActions item={val} />
                  </div>
                </div>
              </CommandItem>
            );
          })}
        </CommandList>
      {/* </ScrollArea> */}
    </Command>
  );
};

export default UsersList;
