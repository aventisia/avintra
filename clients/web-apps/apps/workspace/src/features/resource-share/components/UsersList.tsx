import { LoadingSpinner, NoContentMessage } from "@avplatform/ui";
import { Avatar, AvatarFallback } from "@avplatform/ui/avatar";
import { cn } from "@avplatform/ui/lib";
import { User2Icon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { ResourceTypeEnum } from "../enums/resource-type-enum";
import { useFetchResourceShare } from "../hooks/useFetchResourceShare";
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
  const { data, isLoading } = useFetchResourceShare(resourceId ?? "");

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner className="h-6 w-6" />
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return <NoContentMessage Icon={User2Icon} primaryMessage="No users yet" className="py-8" />;
  }

  return (
    <ul className="flex flex-col gap-1">
      {data?.data?.map((val) => {
        return (
          <li key={val.id} className="flex w-full items-center gap-3 py-1.5">
            <div className="flex min-w-0 grow items-center gap-2">
              <Avatar className={cn("flex h-7 w-7 shrink-0")}>
                <AvatarFallback className="bg-muted text-xs border font-medium capitalize tracking-wider text-secondary">
                  {val?.firstName && val?.lastName
                    ? val.firstName.charAt(0) + val.lastName.charAt(0)
                    : "--"}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <p className="truncate text-sm font-medium text-foreground">{`${val?.firstName} ${val?.lastName}`}</p>
                <span className="truncate text-2xs text-muted-foreground">{val?.username}</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {!isSpaceResource && (
                <span className="shrink-0 text-2xs capitalize text-muted-foreground">
                  {val.accessLevel?.replace(/([A-Z])/g, " $1")}
                </span>
              )}
              {isSpaceResource ? (
                <RemoveUserIconButton id={val.id || ""} />
              ) : (
                <ResourceShareItemActions item={val} />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default UsersList;
