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
    sectionName: "my projects",
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
    ],
  },
  {
    sectionName: "Orchestrator",
    menuItems: [
      {
        permissions: ["SA", "GA"],
        Icon: DesktopIcon,
        name: "machines",
        route: "/orchestrator/machines",
      },
      {
        permissions: ["SA", "GA"],
        Icon: QueueListIcon,
        name: "queues",
        route: "/orchestrator/queues",
      },
      {
        permissions: ["SA", "GA"],
        Icon: AiOutlineThunderbolt,
        name: "triggers",
        route: "/orchestrator/triggers",
      },
      {
        permissions: ["SA", "GA"],
        Icon: MonitorPlayIcon,
        name: "executions",
        route: "/orchestrator/executions",
      },
      {
        permissions: ["SA", "GA"],
        Icon: Library,
        name: "Key Store",
        route: "/orchestrator/keystore",
      },
      {
        permissions: ["SA", "GA"],
        Icon: Shield,
        name: "Vault",
        route: "/orchestrator/vault",
      },
    ],
  },
  {
    sectionName: "Admin",
    menuItems: [
      {
        permissions: ["SA", "GA"],
        Icon: IdentificationIcon,
        name: "tenant",
        route: "/tenant",
      },
      {
        permissions: ["SA", "GA"],
        Icon: TbCertificate,
        name: "licenses & Credits",
        route: "/orchestrator/licenses",
      },
      {
        permissions: ["SA", "GA"],
        Icon: PiScrollLight,
        name: "billing",
        route: "/billing",
      },
      {
        permissions: ["SA", "GA"],
        Icon: UsersIcon,
        name: "users",
        route: "/users",
      },
      {
        permissions: ["SA", "GA"],
        Icon: QuestionMarkCircleIcon,
        name: "support",
        route: "/supportticket",
      },
    ],
  },
  {
    sectionName: "Super Admin",
    menuItems: [
      {
        permissions: ["SA"],
        Icon: IdentificationIcon,
        name: "tenants",
        route: "sa/tenants",
      },
      {
        permissions: ["SA"],
        Icon: TagIcon,
        name: "pricing",
        route: "sa/pricing",
      },
      {
        permissions: ["SA"],
        Icon: TbCertificate,
        name: "licenses & Credits",
        route: "sa/licenses",
      },
      {
        permissions: ["SA"],
        Icon: UsersIcon,
        name: "users",
        route: "/users",
      },
    ],
  },
];

// TODO: Refactor this function to use a more efficient method of checking permissions
// TODO: This function filters the sidebar menu sections based on the user's roles for now.
function getSidebarMenuBasedOnPersmissions(userRoles: string[]): SidebarMenuSectionType[] {
  return sidebarMenuSections
    .map((section) => {
      // Filter menuItems based on item-level permissions (if present)
      const filteredMenuItems = section.menuItems.filter(
        (item) =>
          !item.permissions ||
          item.permissions.some((role: string) => userRoles.includes(role)),
      );

      // Only return the section if it has at least one visible menu item
      if (filteredMenuItems.length === 0) return null;

      return {
        ...section,
        menuItems: filteredMenuItems,
      };
    })
    .filter((section): section is SidebarMenuSectionType => section !== null); // Remove null sections with type guard
}

export { sidebarMenuSections, getSidebarMenuBasedOnPersmissions };
