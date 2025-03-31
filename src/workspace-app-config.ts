import { TbCertificate } from "react-icons/tb";
import {
  BotIcon,
  FileBoxIcon,
  Library,
  MonitorPlayIcon,
  Shield,
  TagIcon,
} from "lucide-react";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { IAppConfig } from "@/react-toolkit/types/app-config";
import { NavLocation } from "@/react-toolkit/types/nav-data-types";
import {
  IdentificationIcon,
  QuestionMarkCircleIcon,
  QueueListIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { DesktopIcon } from "@radix-ui/react-icons";
import { PiScrollLight } from "react-icons/pi";

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
            Icon: QueueListIcon,
            name: "queues",
            route: "/orchestrator/queues",
          },
          {
            Icon: AiOutlineThunderbolt,
            name: "triggers",
            route: "/orchestrator/triggers",
          },
          {
            Icon: MonitorPlayIcon,
            name: "executions",
            route: "/orchestrator/executions",
          },
          {
            Icon: Library,
            name: "Key Store",
            route: "/orchestrator/keystore",
          },
          {
            Icon: Shield,
            name: "Vault",
            route: "/orchestrator/vault",
          },
        ],
      },
      {
        showSection: false, // TODO: Remove this once we have a way to handle this using user roles
        sectionName: "Admin",
        menuItems: [
          {
            Icon: IdentificationIcon,
            name: "tenant",
            route: "/tenants",
          },
          {
            Icon: TbCertificate,
            name: "licenses & Credits",
            route: "/orchestrator/licenses",
          },
          {
            Icon: PiScrollLight,
            name: "billing",
            route: "/billing",
          },
          {
            Icon: UsersIcon,
            name: "users",
            route: "/users",
          },
        ],
      },
      {
        showSection: false, // TODO: Remove this once we have a way to handle this using user roles
        sectionName: "Super Admin",
        menuItems: [
          {
            Icon: IdentificationIcon,
            name: "tenants",
            route: "sa/tenants",
          },
          {
            Icon: TagIcon,
            name: "pricing",
            route: "sa/pricing",
          },
          {
            Icon: TbCertificate,
            name: "licenses & Credits",
            route: "sa/licenses",
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
