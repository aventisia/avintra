import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

import { useOpenTemplate } from "../../hooks/useOpenTemplate";

const OpenTemplateRowAction = ({ accessPath }: { accessPath: string }) => {
  const handleOpenTemplate = useOpenTemplate();

  return (
    <SimpleDDMenuItem
      content="Open"
      Icon={ArrowTopRightOnSquareIcon}
      onClick={() => handleOpenTemplate(accessPath)}
    />
  );
};

export default OpenTemplateRowAction;
