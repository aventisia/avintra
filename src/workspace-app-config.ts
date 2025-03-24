import { BotIcon, FileBoxIcon, LockKeyholeIcon } from 'lucide-react';

import { IAppConfig } from '@/react-toolkit/types/app-config';
import { NavLocation } from '@/react-toolkit/types/nav-data-types';
import {
    ChartPieIcon, CogIcon, IdentificationIcon, PlayIcon, QuestionMarkCircleIcon, QueueListIcon,
    UsersIcon
} from '@heroicons/react/24/outline';
import { DesktopIcon } from '@radix-ui/react-icons';

const workspaceAppConfig: IAppConfig = {
  showUpgradeCard: false,
  showChatAssistant: false,
  searchBoxOptions: {
    show: true,
    position: "center",
  },
  navData: {
    navLocation: NavLocation.sidebar,
    sideNavMenuSections: [
      {
        showSection: true, // TODO: Remove this once we have a way to handle this using user roles
        sectionName: "main menu",
        menuItems: [
          {
            Icon: BotIcon,
            name: "agents",
            route: "/agents",
          },
          {
            Icon: FileBoxIcon,
            name: "AI Models",
            route: "/ai-models",
          },
          {
            Icon: QuestionMarkCircleIcon,
            name: "support",
            route: "/supportticket",
          },
        ],
      },
      {
        showSection: true, // TODO: Remove this once we have a way to handle this using user roles
        sectionName: "Orchestrator",
        menuItems: [
          {
            Icon: DesktopIcon,
            name: "machines",
            route: "/orchestrator/machines",
          },
          {
            Icon: BotIcon,
            name: "Agents",
            route: "/orchestrator/agents",
          },
          {
            Icon: QueueListIcon,
            name: "queues",
            route: "/orchestrator/queues",
          },
          {
            Icon: MonitorPlayIcon,
            name: "executions",
            route: "/orchestrator/executions",
          },
          {
            Icon: Library,
            name: "Key Store",
            route: "/orchestrator/config-hub",
          },
          {
            Icon: Shield,
            name: "Vault",
            route: "/orchestrator/vault",
          },
          {
            Icon: ScrollTextIcon,
            name: "licenses & Credits",
            route: "/orchestrator/licenses",
          },
        ],
      },
      {
        showSection: false, // TODO: Remove this once we have a way to handle this using user roles
        sectionName: "admin options",
        menuItems: [
          {
            Icon: IdentificationIcon,
            name: "tenants",
            route: "/tenants",
          },
          {
            Icon: UsersIcon,
            name: "users",
            route: "/users",
          },
        ],
      },
    ],
  },
};

export { workspaceAppConfig };
