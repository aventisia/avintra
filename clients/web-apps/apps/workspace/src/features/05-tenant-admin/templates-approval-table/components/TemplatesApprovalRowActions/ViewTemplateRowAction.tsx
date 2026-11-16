import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { ArrowUpRightIcon } from "@phosphor-icons/react";

import { useViewTemplate } from "../../hooks/useViewTemplate";

const ViewTemplateRowAction = ({ rowId }: { rowId: string }) => {
  const handleViewTemplate = useViewTemplate();

  return (
    <SimpleDDMenuItem
      content="View"
      Icon={ArrowUpRightIcon}
      onClick={() => handleViewTemplate(rowId)}
    />
  );
};

export default ViewTemplateRowAction;
