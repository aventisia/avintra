import { DCPTabsFooterWrapper } from "@/features/dynamic-config-panel/components/dcp-tabs/DCPTabsFooterWrapper";
import { Button } from "@aventisia/ui/buttons";

const ExecuteButton = () => {
  return (
    <DCPTabsFooterWrapper className="justify-start">
      <Button size={"sm"} type="button">
        Execute
      </Button>
    </DCPTabsFooterWrapper>
  );
};

export default ExecuteButton;
