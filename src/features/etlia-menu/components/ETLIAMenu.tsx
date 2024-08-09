import { cn } from "@/react-toolkit/lib/utils";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/react-toolkit/ui/popover";
import { useETLIAMenuStore } from "../stores/etlia-menu-store";
import { StudioTabType } from "../types/etlia-menu-type";
import { ActionRibbon } from "./action-ribbon/ActionRibbon";
import { ExtractRibbon } from "./extract-ribbon/ExtractRibbon";
import { InferRibbon } from "./infer-ribbon/InferRibbon";
import { LoadRibbon } from "./load-ribbon/LoadRibbon";
import { TransformRibbon } from "./transform-ribbon/TransformRibbon";

interface ETLIAMenuProps {
  className?: string;
}

const tabs: StudioTabType[] = [
  "extract",
  "transform",
  "load",
  "infer",
  "action",
];

export const ETLIAMenu = ({ className }: ETLIAMenuProps) => {
  const { currentTab, setCurrentTab } = useETLIAMenuStore();

  return (
    <Popover open={false}>
      <PopoverTrigger asChild>
        <nav
          className={cn(
            "hidden h-9 items-center justify-center gap-2 rounded-lg bg-muted p-1.5 md:inline-flex",
            className,
          )}
        >
          {tabs?.map((tabName, index) => (
            <Button
              key={index}
              variant={"ghost"}
              className={cn(
                "group h-7 whitespace-nowrap rounded-md px-3 text-slate-600 hover:bg-white hover:text-foreground hover:shadow-sm",
                currentTab === tabName
                  ? "active bg-white text-foreground shadow-sm"
                  : null,
              )}
              onClick={() => {
                setCurrentTab(tabName);
              }}
            >
              <div className="flex flex-col items-center">
                <span className="block whitespace-nowrap text-sm font-medium capitalize">
                  {tabName}
                </span>
              </div>
            </Button>
          ))}
        </nav>
      </PopoverTrigger>
      <PopoverContent className="mt-0.5 h-[6.2rem] w-screen rounded-none border-none bg-white shadow-none">
        <div className="mx-1 flex items-center rounded-lg border shadow-sm">
          {currentTab === "extract" && <ExtractRibbon />}
          {currentTab === "transform" && <TransformRibbon />}
          {currentTab === "load" && <LoadRibbon />}
          {currentTab === "infer" && <InferRibbon />}
          {currentTab === "action" && <ActionRibbon />}
        </div>
      </PopoverContent>
    </Popover>
  );
};
