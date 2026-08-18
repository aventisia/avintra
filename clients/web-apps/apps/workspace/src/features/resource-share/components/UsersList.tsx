import { NoContentMessage } from "@avplatform/ui";
import { Avatar, AvatarFallback } from "@avplatform/ui/avatar";
import { Command, CommandEmpty, CommandItem, CommandList } from "@avplatform/ui/command";
import { cn } from "@avplatform/ui/lib";
import { User2Icon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useFetchResourceShare } from "../hooks/useFetchResourceShare";
import { ResourceTypeEnum } from "../enums/resource-type-enum";
import { useResourceShareStore } from "../stores/resource-share-store";
import { ResourceShareItemActions } from "./resource-share-item-actions";
import { RemoveUserIconButton } from "./resource-share-item-actions/RemoveUserIconButton";

const UsersList = () => {
  const { resourceId, resourceType } = useResourceShareStore(
    useShallow((s) => ({
      resourceId: s.resourceId,
      resourceType: s.resourceType,
    })),
  );

  // Space resources only support removal (no View/Edit/Owner actions).
  const isSpaceResource = resourceType === ResourceTypeEnum.Space;

  // Use to fetch users list of Resource Share
  const { data } = useFetchResourceShare(resourceId ?? "");

  return (
    <Command>
      <CommandEmpty>
        <NoContentMessage Icon={User2Icon} primaryMessage="No User found" />
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
              <div className={"flex w-full items-center gap-3 rounded-lg px-0.5 py-0.5 pl-2"}>
                {/* Content container */}
                <div className="flex grow items-center gap-2">
                  <Avatar className={cn("flex h-7 w-7")}>
                    <AvatarFallback className="bg-muted text-xs border font-medium capitalize tracking-wider text-secondary">
                      {val?.firstName && val?.lastName
                        ? val.firstName.charAt(0) + val.lastName.charAt(0)
                        : "--"}
                    </AvatarFallback>
                  </Avatar>
                  {/* User name */}
                  <div className="flex flex-col">
                    <p>{`${val?.firstName} ${val?.lastName}`}</p>
                    <span className="text-2xs text-muted-foreground">{val?.username}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* The access level is not meaningful for Space resources (a user
                      is simply a member of the space), so hide it for them. */}
                  {!isSpaceResource && (
                    <span className="text-2xs text-muted-foreground">
                      {" "}
                      {val.accessLevel?.replace(/([A-Z])/g, " $1")}
                    </span>
                  )}
                  {isSpaceResource ? (
                    <RemoveUserIconButton id={val.id || ""} />
                  ) : (
                    <ResourceShareItemActions item={val} />
                  )}
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
