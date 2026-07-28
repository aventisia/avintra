import {
  CommandInput,
  Command,
  CommandList,
  CommandItem,
} from "@avplatform/ui/command";
import { ScrollArea } from "@avplatform/ui/scroll";
import { FlowUserDto } from "../../dtos/flow-user-dto";
import { Avatar, AvatarFallback } from "@avplatform/ui/avatar";
import { cn } from "@avplatform/ui/lib";
import { FlowUserItemActions } from "./flow-user-item-actions";
import { useFetchFlowUserList } from "../../hooks/useFetchFlowUserList";
import { UsersNoContentMessage } from "./UsersNoContentMessage";

const UserList = () => {
  const { data } = useFetchFlowUserList();

  return (
    <Command>
      <div className="my-1.5 rounded-lg bg-slate-100">
        <CommandInput
          className="h-9 text-xs"
          placeholder="Search..."
          autoFocus
        />
      </div>
      <UsersNoContentMessage />
      <ScrollArea>
        <CommandList>
          {data?.data?.map((val: FlowUserDto) => {
            return (
              <CommandItem
                key={val.id}
                value={`${val.userFullName}${val.userName}${val.type}`}
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
                      <AvatarFallback className="bg-primary text-xs font-bold capitalize tracking-wider text-secondary text-white">
                        {val.initials ? val.initials : "--"}
                      </AvatarFallback>
                    </Avatar>
                    {/* Agent name */}
                    <div className="flex flex-col ">
                      <p>{val.userFullName}</p>
                      <span className="text-2xs text-muted-foreground">
                        {val.userName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground"> {val.type}</span>
                    <FlowUserItemActions item={val} />
                  </div>
                </div>
              </CommandItem>
            );
          })}
        </CommandList>
      </ScrollArea>
    </Command>
  );
};

export default UserList;
