import { SidebarMenuSectionType } from "@aventisia/ui/types";
import {
  BanknotesIcon,
  ChartPieIcon,
  IdentificationIcon,
  QuestionMarkCircleIcon,
  QueueListIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { DesktopIcon } from "@radix-ui/react-icons";
import {
  ArchiveIcon,
  BadgeDollarSignIcon,
  BotIcon,
  CheckCheckIcon,
  FileBoxIcon,
  Library,
  LibraryIcon,
  MonitorPlayIcon,
  ServerIcon,
  Shield,
  Wallet,
  Workflow,
} from "lucide-react";
import { AiOutlineThunderbolt } from "react-icons/ai";

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
      {
        Icon: LibraryIcon,
        name: "Library",
        route: "/library",
      },
    ],
  },
  {
    sectionName: "Orchestrator",
    menuItems: [
      {
        permissions: ["SA", "TA", "OM"],
        Icon: BotIcon,
        name: "Published",
        route: "/orchestrator/published-agents",
      },
      {
        permissions: ["SA", "TA", "OM"],
        Icon: DesktopIcon,
        name: "machines",
        route: "/orchestrator/machines",
      },
      {
        permissions: ["SA", "TA", "OM"],
        Icon: QueueListIcon,
        name: "queues",
        route: "/orchestrator/queues",
      },
      {
        permissions: ["SA", "TA", "OM"],
        Icon: AiOutlineThunderbolt,
        name: "triggers",
        route: "/orchestrator/triggers",
      },
      {
        permissions: ["SA", "TA", "OM"],
        Icon: MonitorPlayIcon,
        name: "executions",
        route: "/orchestrator/executions",
      },
      {
        permissions: ["SA", "TA", "OM"],
        Icon: Library,
        name: "Key Store",
        route: "/orchestrator/keystore",
      },
      {
        permissions: ["SA", "TA", "OM"],
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
        permissions: ["SA", "TA"],
        Icon: IdentificationIcon,
        name: "tenant",
        route: "/tenant",
      },
      {
        permissions: ["SA", "TA"],
        Icon: Workflow,
        name: "integrations",
        route: "/integrations",
      },
      {
        permissions: ["SA", "TA"],
        Icon: Wallet,
        name: "credits Usage",
        route: "/credits-usage",
      },
      {
        permissions: ["SA", "TA"],
        Icon: CheckCheckIcon,
        name: "Approvals",
        route: "/approvals",
      },
      {
        permissions: ["SA", "TA"],
        Icon: UsersIcon,
        name: "users",
        route: "/users",
      },
      {
        permissions: ["SA", "TA"],
        Icon: ArchiveIcon,
        name: "archive",
        route: "/archive",
      },
      {
        permissions: ["SA", "TA"],
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
        Icon: UsersIcon,
        name: "users",
        route: "/users",
      },
      {
        permissions: ["SA"],
        Icon: CheckCheckIcon,
        name: "Approvals",
        route: "sa/approvals",
      },
      {
        permissions: ["SA"],
        Icon: BadgeDollarSignIcon,
        name: "subscription plans",
        route: "sa/subscription-plans",
      },
      {
        permissions: ["SA"],
        Icon: ServerIcon,
        name: "on-prem LLMs",
        route: "sa/on-prem-llms",
      },
      {
        permissions: ["SA"],
        Icon: BanknotesIcon,
        name: "Credit Plans",
        route: "sa/credit-plans",
      },
      {
        permissions: ["SA"],
        Icon: ChartPieIcon,
        name: "Tenants Consumption",
        route: "sa/tenants-consumption",
      },
    ],
  },
];

// TODO: Refactor this function to use a more efficient method of checking permissions
// TODO: This function filters the sidebar menu sections based on the user's roles for now.
function getSidebarMenuBasedOnPersmissions(
  userRoles: string[],
): SidebarMenuSectionType[] {
  return sidebarMenuSections
    .map((section) => {
      // Filter menuItems based on item-level permissions (if present)
      const filteredMenuItems = section.menuItems.filter(
        (item) =>
          !item.permissions ||
          item.permissions.some((role: string) => userRoles.includes(role)),
      );

      const productionMenuItems = filteredMenuItems.filter(
        (item) =>
          item.name !== "integrations" || import.meta.env.MODE !== "production",
      );

      // Only return the section if it has at least one visible menu item
      if (productionMenuItems.length === 0) return null;

      return {
        ...section,
        menuItems: productionMenuItems,
      };
    })
    .filter((section): section is SidebarMenuSectionType => section !== null); // Remove null sections with type guard
}

export { sidebarMenuSections, getSidebarMenuBasedOnPersmissions };
