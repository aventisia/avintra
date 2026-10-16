import { NoContentMessage } from "@avplatform/ui";
import { Avatar, AvatarFallback } from "@avplatform/ui/avatar";
import { Command, CommandEmpty, CommandItem, CommandList } from "@avplatform/ui/command";
import { cn } from "@avplatform/ui/lib";
import { BotIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useFetchUiBuilderProjectUsers } from "../../hooks/useFetchUiBuilderProjectUsers";
import { useUiBuilderUsersStore } from "../../stores/ui-builder-users-store";
import { UiBuilderUsersListItemActions } from "./UiBuilderUsersListItemActions";

const UiBuilderUsersList = () => {
  const { uiBuilderProjectId } = useUiBuilderUsersStore(
    useShallow((state) => ({
      uiBuilderProjectId: state.uiBuilderProjectId,
    })),
  );

  const { data } = useFetchUiBuilderProjectUsers(uiBuilderProjectId);

  return (
    <Command>
      <CommandEmpty>
        <NoContentMessage Icon={BotIcon} primaryMessage="No User found" />
      </CommandEmpty>
      <CommandList>
        {data?.data?.map((val) => {
          return (
            <CommandItem
              key={val.id}
              value={`${val?.username}${val?.firstName}${val?.lastName}`}
              className="group/CommandItem cursor-pointer rounded-lg p-1"
            >
              <div className={"flex w-full items-center gap-3 rounded-lg px-0.5 py-0.5 pl-2"}>
                <div className="flex grow items-center gap-2">
                  <Avatar className={cn("flex h-7 w-7")}>
                    <AvatarFallback className="bg-muted text-xs border font-medium capitalize tracking-wider text-secondary">
                      {val?.initials ? val.initials : "--"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p>{`${val?.firstName} ${val?.lastName}`}</p>
                    <span className="text-2xs text-muted-foreground">{val?.username}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <UiBuilderUsersListItemActions item={val} />
                </div>
              </div>
            </CommandItem>
          );
        })}
      </CommandList>
    </Command>
  );
};

export default UiBuilderUsersList;
