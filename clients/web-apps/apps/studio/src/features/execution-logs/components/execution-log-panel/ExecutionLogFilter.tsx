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

const ALL = "all";
const ERRORS = "errors";

export const ExecutionLogFilter = ({ errorsOnly, onChange }: Props) => {
  return (
    <Tabs value={errorsOnly ? ERRORS : ALL} onValueChange={(value) => onChange(value === ERRORS)}>
      <TabsList aria-label="Filter runs" className={SEGMENTED_TABS_LIST_CLASS}>
        <TabsTrigger value={ALL} className={SEGMENTED_TABS_TRIGGER_CLASS}>
          All
        </TabsTrigger>
        <TabsTrigger value={ERRORS} className={SEGMENTED_TABS_TRIGGER_CLASS}>
          Errors
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
