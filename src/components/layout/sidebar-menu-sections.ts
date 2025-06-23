import { SidebarMenuSectionType } from "@aventisia/ui/types";
import {
  IdentificationIcon,
  QuestionMarkCircleIcon,
  QueueListIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { DesktopIcon } from "@radix-ui/react-icons";
import {
  BotIcon,
  FileBoxIcon,
  Library,
  MonitorPlayIcon,
  Shield,
  TagIcon,
} from "lucide-react";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { PiScrollLight } from "react-icons/pi";
import { TbCertificate } from "react-icons/tb";

const sidebarMenuSections: SidebarMenuSectionType[] = [
  {
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
    permissions: ["SA", "GA"],
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
    permissions: ["SA", "GA"],
    sectionName: "Admin",
    menuItems: [
      {
        Icon: IdentificationIcon,
        name: "tenant",
        route: "/tenant",
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
    permissions: ["SA"],
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
];

// TODO: Refactor this function to use a more efficient method of checking permissions
// TODO: This function filters the sidebar menu sections based on the user's roles for now.
function getSidebarMenuBasedOnPersmissions(userRoles: string[]) {
  return sidebarMenuSections.filter(
    (section) =>
      // If section has no permissions, it is accessible to all users
      !section.permissions ||
      section.permissions?.some((role) => userRoles.includes(role)),
  );
}

export { sidebarMenuSections, getSidebarMenuBasedOnPersmissions };
