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
  FolderCogIcon,
  LibraryIcon,
  MonitorPlayIcon,
  ServerIcon,
  Shield,
  Wallet,
  Workflow,
} from "lucide-react";
import { AiOutlineThunderbolt } from "react-icons/ai";

import { IS_TAURI } from "@/constants/constants";

const sidebarMenuSections: SidebarMenuSectionType[] = [
  {
    sectionName: "my projects",
    menuItems: [
      {
        Icon: BotIcon,
        name: "agents",
        route: "/agents",
        permissions: ["TD"],
      },
      {
        Icon: FileBoxIcon,
        name: "AI Models",
        route: "/ai-models",
        permissions: ["TD"],
      },
      {
        Icon: LibraryIcon,
        name: "Library",
        route: "/library",
        permissions: ["TD"],
      },
    ],
  },
  {
    sectionName: "Orchestrator",
    menuItems: [
      {
        permissions: ["OM"],
        Icon: BotIcon,
        name: "Published",
        route: "/orchestrator/published-agents",
      },
      {
        permissions: ["OM"],
        Icon: DesktopIcon,
        name: "machines",
        route: "/orchestrator/machines",
      },
      {
        permissions: ["OM"],
        Icon: QueueListIcon,
        name: "queues",
        route: "/orchestrator/queues",
      },
      {
        permissions: ["OM"],
        Icon: AiOutlineThunderbolt,
        name: "triggers",
        route: "/orchestrator/triggers",
      },
      {
        permissions: ["OM"],
        Icon: MonitorPlayIcon,
        name: "Jobs",
        route: "/orchestrator/jobs",
      },
      {
        permissions: ["OM"],
        Icon: FolderCogIcon,
        name: "Key Store",
        route: "/orchestrator/keystore",
      },
      {
        permissions: ["OM"],
        Icon: Shield,
        name: "Vault",
        route: "/orchestrator/vault",
      },
    ],
  },
  {
    sectionName: "Assist",
    menuItems: [
      // Add Assist my agents only if not production
      ...(import.meta.env.MODE !== "production" && IS_TAURI
        ? [
            {
              permissions: ["TU"],
              Icon: BotIcon,
              name: "my agents",
              route: "/assist/my-agents",
            },
          ]
        : []),
      // Add Assist my queue only if not production
      ...(import.meta.env.MODE !== "production" && IS_TAURI
        ? [
            {
              permissions: ["TU"],
              Icon: QueueListIcon,
              name: "my queue",
              route: "/assist/my-queue",
            },
          ]
        : []),
    ],
  },
  {
    sectionName: "Tenant Admin",
    menuItems: [
      {
        permissions: ["TA"],
        Icon: IdentificationIcon,
        name: "tenant",
        route: "/tenant",
      },
      // Add integrations only if not production
      ...(import.meta.env.MODE !== "production"
        ? [
            {
              permissions: ["TA"],
              Icon: Workflow,
              name: "integrations",
              route: "/integrations",
            },
          ]
        : []),
      {
        permissions: ["TA"],
        Icon: Wallet,
        name: "credits Usage",
        route: "/credits-usage",
      },
      {
        permissions: ["TA"],
        Icon: CheckCheckIcon,
        name: "Approvals",
        route: "/approvals",
      },
      {
        permissions: ["TA"],
        Icon: UsersIcon,
        name: "users",
        route: "/users",
      },
      {
        permissions: ["TA"],
        Icon: ArchiveIcon,
        name: "archive",
        route: "/archive",
      },
      {
        permissions: ["TA"],
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
  {
    sectionName: "Global Admin",
    menuItems: [
      ...(import.meta.env.MODE !== "production"
        ? [
            {
              permissions: ["SA"],
              Icon: IdentificationIcon,
              name: "On-prem Tenants",
              route: "/on-prem/tenant",
            },
          ]
        : []),
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
