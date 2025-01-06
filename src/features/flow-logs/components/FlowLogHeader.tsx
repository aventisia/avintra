import {
  Dialog,
  DialogContent,
  DialogDefaultHeader,
  DialogTrigger,
} from "@/react-toolkit/ui/dialog";
import { FlowLogsTable } from "./FlowLogsTable";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
// import { useLocation } from "react-router-dom";

const FlowLogHeader = () => {
  // const { search } = useLocation();
  return (
    <>
      <Dialog>
        <DialogTrigger>
          <span
            className={
              "flex h-6 items-center justify-center gap-2 text-sm font-semibold"
            }
          >
            Logs
          </span>
        </DialogTrigger>
        <DialogContent
          side="right"
          className="flex h-screen min-w-[75vw] flex-col"
        >
          <DialogDefaultHeader heading="Flow logs" />
          <ScrollArea>
            <FlowLogsTable />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FlowLogHeader;
