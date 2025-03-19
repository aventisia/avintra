import { IAppConfig } from "@/react-toolkit/types/app-config";
import { NavLocation } from "@/react-toolkit/types/nav-data-types";
import {
  FolderIcon,
  IdentificationIcon,
  QuestionMarkCircleIcon,
  QueueListIcon,
  CogIcon,
  ChartPieIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { DesktopIcon } from "@radix-ui/react-icons";
import { Bot, Briefcase, LockKeyholeIcon } from "lucide-react";

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
            route: "/orchestrator/machines",
          },
          {
            Icon: Bot,
            name: "Agents",
            route: "/orchestrator/agents",
          },
          {
            Icon: QueueListIcon,
            name: "queues",
            route: "/orchestrator/queues",
          },
          {
            Icon: Briefcase,
            name: "jobs",
            route: "/orchestrator/jobs",
          },
          {
            Icon: CogIcon,
            name: "Keystore",
            route: "/orchestrator/config-hub",
          },
          {
            Icon: LockKeyholeIcon,
            name: "Vault",
            route: "/orchestrator/vault",
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

