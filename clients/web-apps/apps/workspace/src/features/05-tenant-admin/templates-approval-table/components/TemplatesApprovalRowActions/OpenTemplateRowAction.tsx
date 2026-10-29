import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { ExternalLinkIcon } from "lucide-react";

import { stripLeadingSlash } from "@/utils/strip-leading-slash";

const OpenTemplateRowAction = ({ accessPath }: { accessPath: string }) => {
  const handleOpenTemplate = () => {
    const url = `${import.meta.env.VITE_STUDIO_PATH}${stripLeadingSlash(accessPath)}`;
    window.open(url, "_blank");
  };

  return <SimpleDDMenuItem content="Open" Icon={ExternalLinkIcon} onClick={handleOpenTemplate} />;
};

export default OpenTemplateRowAction;
