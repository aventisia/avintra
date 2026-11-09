import { IconTile, type IconTileProps } from "@avplatform/ui/icon-tile";
import { cn } from "@avplatform/ui/lib";

import NewAgentIcon from "@/components/NewAgentIcon";

import { getTemplateType } from "../utils/template-attributes.util";

type TemplateMarkProps = Omit<IconTileProps, "Icon"> & { type?: string };

/**
 * Tile with the template type's icon, tinted like the agent tiles on the Agents page.
 */
export const TemplateMark = ({ type, className, ...props }: TemplateMarkProps) => {
  const templateType = getTemplateType(type);

  return (
    <IconTile
      Icon={templateType?.icon ?? NewAgentIcon}
      className={cn(templateType?.tint, className)}
      {...props}
    />
  );
};
