import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

import { stripLeadingSlash } from "@/utils/strip-leading-slash";

const OpenTemplateRowAction = ({ accessPath }: { accessPath: string }) => {
  const handleOpenTemplate = () => {
    const url =
      window.location.origin +
      `${import.meta.env.VITE_STUDIO_PATH}${stripLeadingSlash(accessPath)}`;
    window.open(url, "_blank");
  };

  return (
    <SimpleDDMenuItem
      content="Open"
      Icon={ArrowTopRightOnSquareIcon}
      onClick={handleOpenTemplate}
    />
  );
};

export default OpenTemplateRowAction;
