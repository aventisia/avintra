import { IAppConfig } from "@/react-toolkit/types/app-config";
import { NavLocation } from "@/react-toolkit/types/nav-data-types";
import {
  //ArchiveBoxIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  FolderIcon,
  //HomeIcon,
  IdentificationIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
  UsersIcon,
  PlayIcon,
  BellIcon,
  QueueListIcon,
  CogIcon,
  ChartPieIcon
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
          // {
          //   Icon: HomeIcon,
          //   name: "home",
          //   route: "/home",
          // },
          {
            Icon: FolderIcon,
            name: "projects",
            route: "/projects",
          },
          // {
          //   Icon: ArchiveBoxIcon,
          //   name: "marketplace",
          //   route: "/marketplace",
          // },
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
            name: "dashboard",
            route: "/dashboard",
          },
          {
            Icon: DesktopIcon,
            name: "machines",
            route: "/orchestrator/machines",
          },
          {
            Icon: BellIcon,
            name: "Flows/Agents",
            route: "/orchestrator/flows",
          },
          {
            Icon: QueueListIcon,
            name: "queue",
            route: "/orchestrator/queue",
          },
          {
            Icon: PlayIcon,
            name: "execution",
            route: "/orchestrator/execution",
          },
          {
            Icon: CogIcon,
            name: "config hub",
            route: "/orchestrator/config-hub",
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
          {
            Icon: UserGroupIcon,
            name: "groups",
            route: "/groups",
          },
          {
            Icon: CreditCardIcon,
            name: "billing",
            route: "/billing",
          },
          {
            Icon: Cog6ToothIcon,
            name: "settings",
            route: "/settings",
          },
          {
            Icon: QuestionMarkCircleIcon,
            name: "support",
            route: "/supportticket-reviewer",
          },
        ],
      },
    ],
  },
};

export { workspaceAppConfig };
