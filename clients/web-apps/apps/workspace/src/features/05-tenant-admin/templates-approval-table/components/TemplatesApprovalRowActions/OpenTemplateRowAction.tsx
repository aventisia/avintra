import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { ArrowSquareOutIcon } from "@phosphor-icons/react";

import { stripLeadingSlash } from "@/utils/strip-leading-slash";

const OpenTemplateRowAction = ({ accessPath }: { accessPath: string }) => {
  const handleOpenTemplate = () => {
    const url = `${import.meta.env.VITE_STUDIO_PATH}${stripLeadingSlash(accessPath)}`;
    window.open(url, "_blank");
  };

  return <SimpleDDMenuItem content="Open" Icon={ArrowSquareOutIcon} onClick={handleOpenTemplate} />;
};

export default OpenTemplateRowAction;
