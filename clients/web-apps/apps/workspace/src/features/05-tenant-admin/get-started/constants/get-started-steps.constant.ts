import type { IconProps } from "@avplatform/ui/types";
import { CpuIcon, FolderSimpleUserIcon, ShieldIcon, UsersIcon } from "@phosphor-icons/react";

import NewAgentIcon from "@/components/NewAgentIcon";

export type GetStartedStep = {
  /** Stable id stored in the user's progress; never renumber. */
  step: number;
  title: string;
  description: string;
  route: string;
  /** Same icon as the page's sidebar entry, so users recognise where they land. */
  Icon: React.ComponentType<IconProps>;
};

export const GET_STARTED_STEPS: GetStartedStep[] = [
  {
    step: 1,
    title: "Invite your team",
    description: "Add the people who will work here and give them the right roles.",
    route: "/tenant/users",
    Icon: UsersIcon,
  },
  {
    step: 2,
    title: "Organise spaces",
    description: "Group people and resources by team or project.",
    route: "/tenant/spaces",
    Icon: FolderSimpleUserIcon,
  },
  {
    step: 3,
    title: "Store credentials in the vault",
    description: "Keep app secrets encrypted, with every access audited.",
    route: "/configure/vault",
    Icon: ShieldIcon,
  },
  {
    step: 4,
    title: "Enable AI models",
    description: "Connect a model provider and choose the models your agents use.",
    route: "/tenant/model-providers",
    Icon: CpuIcon,
  },
  {
    step: 5,
    title: "Build your first agent",
    description: "Create an agent in Build, test it, and publish it.",
    route: "/agents",
    Icon: NewAgentIcon,
  },
];
