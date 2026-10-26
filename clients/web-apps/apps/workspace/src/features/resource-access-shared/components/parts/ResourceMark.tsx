import { cn } from "@avplatform/ui/lib";
import type { IconProps } from "@avplatform/ui/types";
import { QueueListIcon } from "@heroicons/react/24/outline";
import {
  BookOpenCheckIcon,
  BoxesIcon,
  FolderCogIcon,
  PuzzleIcon,
  Shield,
  WrenchIcon,
} from "lucide-react";
import { AiOutlineThunderbolt } from "react-icons/ai";

import NewAgentIcon from "@/components/NewAgentIcon";

import { ResourceTypeEnum } from "../../../resource-user-access/enums/resource-type-enum";

const RESOURCE_ICONS: Record<ResourceTypeEnum, React.ComponentType<IconProps>> = {
  [ResourceTypeEnum.Queue]: QueueListIcon,
  [ResourceTypeEnum.Trigger]: AiOutlineThunderbolt,
  [ResourceTypeEnum.ConfigStore]: FolderCogIcon,
  [ResourceTypeEnum.VaultCredential]: Shield,
  [ResourceTypeEnum.KnowledgeBase]: BookOpenCheckIcon,
  [ResourceTypeEnum.Skill]: PuzzleIcon,
  [ResourceTypeEnum.Tool]: WrenchIcon,
  [ResourceTypeEnum.Flow]: NewAgentIcon,
  [ResourceTypeEnum.FlowVersion]: NewAgentIcon,
  [ResourceTypeEnum.Space]: FolderCogIcon,
};

type ResourceMarkProps = {
  resourceType: ResourceTypeEnum | null;
  className?: string;
};

/**
 * Sidebar icon of the resource whose agent access is being configured.
 */
export const ResourceMark = ({ resourceType, className }: ResourceMarkProps) => {
  const Icon = (resourceType && RESOURCE_ICONS[resourceType]) || BoxesIcon;

  return <Icon className={cn("text-[--icon-color]", className)} />;
};
