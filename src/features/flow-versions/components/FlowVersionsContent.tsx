import { cn } from "@/react-toolkit/lib/utils";
import { Avatar, AvatarFallback } from "@/react-toolkit/ui/avatar";
import { format } from "date-fns";
import { FlowVersionItemActions } from "./flow-version-item-actions";
import { EyeIcon } from "@heroicons/react/24/outline";
import { useFetchFlowVersions } from "../hooks/useFetchFlowVersions";
import { useEffect } from "react";
import { useFlowsVersionsStore } from "../stores/flow-versions-store";
import { useShallow } from "zustand/react/shallow";

const FlowVersionsContent = () => {
  // Get store state and actions
  const { versionID, setVersionID } = useFlowsVersionsStore(
    useShallow((state) => ({
      versionID: state.versionID,
      setVersionID: state.setVersionID,
    })),
  );

  // Fetch flow versions list data
  const { data } = useFetchFlowVersions();

  //Set initial version to view as draft
  useEffect(() => {
    setVersionID(data?.data[0].id || "");
  }, [data?.data, setVersionID]);

  // Format date
  const getFormattedDate = (date: Date) => format(date, "MMM d, h:mm a");

  return (
    <>
      {data &&
        data?.data
          ?.map((item) => {
            const isView = item.id == versionID;
            return (
              <div
                className={cn(
                  "mb-2 flex w-full items-center gap-3 px-1 py-0.5 last:mb-0",
                )}
              >
                {/* User thumbnail */}
                <Avatar className={cn("flex", "h-8 w-8")}>
                  <AvatarFallback className="text-sm capitalize">
                    {item.createdByUserInitials}
                  </AvatarFallback>
                </Avatar>

                {/* Content container */}
                <div className="flex grow flex-col gap-0">
                  {/* Flow name */}
                  <span className="truncate text-xs font-medium leading-5">{`Version ${item.versionNumber}`}</span>

                  {/* Time container */}
                  <div className="mt-[1px] flex items-center text-2xs text-muted-foreground">
                    {item.createdOn && getFormattedDate(item.createdOn)}
                  </div>
                </div>

                <div className="flex w-12 items-center justify-end gap-1">
                  {isView && <EyeIcon className="h-3.5 w-3.5" />}
                  {/* Actions container */}
                  <FlowVersionItemActions
                    flowId={item.flowId}
                    isView={isView}
                    versionID={item.id || ""}
                  />
                </div>
              </div>
            );
          })
          ?.reverse()}
    </>
  );
};

export default FlowVersionsContent;
