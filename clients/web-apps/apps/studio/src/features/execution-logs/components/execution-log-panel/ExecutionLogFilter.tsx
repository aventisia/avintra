import { cn } from "@avplatform/ui/lib";
import {
  SEGMENTED_TABS_LIST_CLASS,
  SEGMENTED_TABS_TRIGGER_CLASS,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@avplatform/ui/tabs";

interface Props {
  errorsOnly: boolean;
  onChange: (errorsOnly: boolean) => void;
}

const LIST_CLASS = cn(SEGMENTED_TABS_LIST_CLASS, "h-7 rounded-md");
const TRIGGER_CLASS = cn(SEGMENTED_TABS_TRIGGER_CLASS, "rounded-[5px] px-2.5 text-hint");

const ALL = "all";
const ERRORS = "errors";

export const ExecutionLogFilter = ({ errorsOnly, onChange }: Props) => {
  return (
    <Tabs value={errorsOnly ? ERRORS : ALL} onValueChange={(value) => onChange(value === ERRORS)}>
      <TabsList aria-label="Filter runs" className={LIST_CLASS}>
        <TabsTrigger value={ALL} className={TRIGGER_CLASS}>
          All
        </TabsTrigger>
        <TabsTrigger value={ERRORS} className={TRIGGER_CLASS}>
          Errors
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
