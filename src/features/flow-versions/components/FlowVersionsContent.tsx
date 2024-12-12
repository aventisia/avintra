import { cn } from "@/react-toolkit/lib/utils";
import { Avatar, AvatarFallback } from "@/react-toolkit/ui/avatar";
import { format } from "date-fns";
import { FlowVersionItemActions } from "./flow-version-item-actions";
import { EyeIcon } from "@heroicons/react/24/outline";

const FlowVersionsContent = () => {
  const date = new Date();
  // Format date
  const getFormattedDate = (date: Date) => format(date, "MMM d, h:mm a");

  return (
    <>
      {"987654321".split("").map((item) => {
        const isView = item == "3";
        return (
          <div
            className={cn(
              "mb-2 flex w-full items-center gap-3 px-1 py-0.5 last:mb-0",
            )}
          >
            {/* User thumbnail */}
            <Avatar className={cn("flex", "h-8 w-8")}>
              <AvatarFallback className="text-sm capitalize">VB</AvatarFallback>
            </Avatar>

            {/* Content container */}
            <div className="flex grow flex-col gap-0">
              {/* Flow name */}
              <span className="truncate text-xs font-medium leading-5">{`Version ${item}`}</span>

              {/* Time container */}
              <div className="mt-[1px] flex items-center text-2xs text-muted-foreground">
                {getFormattedDate(date)}
              </div>
            </div>

            <div className="flex w-12 items-center justify-end gap-1">
              {isView && <EyeIcon className="h-3.5 w-3.5" />}
              {/* Actions container */}
              <FlowVersionItemActions flowId={"flowId"} isView={isView} />
            </div>
          </div>
        );
      })}
    </>
  );
};

export default FlowVersionsContent;
