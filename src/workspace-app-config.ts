import { IAppConfig } from "@/react-toolkit/types/app-config";
import { NavLocation } from "@/react-toolkit/types/nav-data-types";
import {
  BellIcon,
  ChartPieIcon,
  CogIcon,
  FolderIcon,
  IdentificationIcon,
  PlayIcon,
  QuestionMarkCircleIcon,
  QueueListIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { DesktopIcon } from "@radix-ui/react-icons";

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
            Icon: FolderIcon,
            name: "projects",
            route: "/projects",
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
            Icon: ChartPieIcon,
            name: "overview",
            route: "/overview",
          },
          {
            Icon: DesktopIcon,
            name: "machines",
            route: "/machines",
          },
          {
            Icon: BellIcon,
            name: "Agents",
            route: "/agents",
          },
          {
            Icon: QueueListIcon,
            name: "queues",
            route: "/queues",
          },
          {
            Icon: PlayIcon,
            name: "executions",
            route: "/executions",
          },
          {
            Icon: CogIcon,
            name: "config hub",
            route: "/config-hub",
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

