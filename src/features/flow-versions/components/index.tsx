import {
  Popover,
  PopoverContent,
  PopoverDefaultHeader,
} from "@/react-toolkit/ui/popover";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { FlowVersionsTrigger } from "./FlowVersionsTrigger";
import FlowVersionsContent from "./FlowVersionsContent";

export const FlowVersions = () => {
  return (
    <Popover>
      <FlowVersionsTrigger />
      <PopoverContent
        align="end"
        variant={"responsive"}
        className="mt-0 mlg:mt-1.5"
      >
        <PopoverDefaultHeader heading={"Versions"}/>
        <ScrollArea className="grow p-2">
          <FlowVersionsContent />
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
