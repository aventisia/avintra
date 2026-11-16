import { cn } from "@avplatform/ui/lib";
import type { IconProps } from "@avplatform/ui/types";
import {
  AppWindowIcon,
  BookOpenTextIcon,
  FolderSimpleUserIcon,
  BrowserIcon,
  LightningIcon,
  ListIcon,
  PackageIcon,
  PuzzlePieceIcon,
  ShieldIcon,
  WrenchIcon,
} from "@phosphor-icons/react";

import NewAgentIcon from "@/components/NewAgentIcon";

import { ResourceTypeEnum } from "../../../resource-user-access/enums/resource-type-enum";

const RESOURCE_ICONS: Record<ResourceTypeEnum, React.ComponentType<IconProps>> = {
  [ResourceTypeEnum.Queue]: ListIcon,
  [ResourceTypeEnum.Trigger]: LightningIcon,
  [ResourceTypeEnum.ConfigStore]: FolderSimpleUserIcon,
  [ResourceTypeEnum.VaultCredential]: ShieldIcon,
  [ResourceTypeEnum.KnowledgeBase]: BookOpenTextIcon,
  [ResourceTypeEnum.Skill]: PuzzlePieceIcon,
  [ResourceTypeEnum.Tool]: WrenchIcon,
  [ResourceTypeEnum.Flow]: NewAgentIcon,
  [ResourceTypeEnum.FlowVersion]: NewAgentIcon,
  [ResourceTypeEnum.Space]: FolderSimpleUserIcon,
  [ResourceTypeEnum.UiBuilder]: BrowserIcon,
  [ResourceTypeEnum.UiBuilderPublished]: AppWindowIcon,
};

type ResourceMarkProps = {
  resourceType: ResourceTypeEnum | null;
  className?: string;
};

/**
 * Sidebar icon of the resource whose agent access is being configured.
 */
export const ResourceMark = ({ resourceType, className }: ResourceMarkProps) => {
  const Icon = (resourceType && RESOURCE_ICONS[resourceType]) || PackageIcon;

  return <Icon className={cn("text-[--icon-color]", className)} />;
};
