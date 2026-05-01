import { IS_TAURI } from "@/constants/constants";
import {
  SidebarMenuItemExtended,
  SidebarMenuSectionExtended,
} from "@/react-toolkit/types/sidebar-menu-types";
import { deploymentType } from "@/react-toolkit/types/user-session-types";

import {
  BanknotesIcon,
  // ChartPieIcon,
  IdentificationIcon,
  QuestionMarkCircleIcon,
  QueueListIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { DesktopIcon } from "@radix-ui/react-icons";
import {
  ArchiveIcon,
  BadgeDollarSignIcon,
  BookOpenCheckIcon,
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

import NewAgentIcon from "../NewAgentIcon";
import NewChatIcon from "../NewChatIcon";

const sidebarMenuSections: SidebarMenuSectionExtended[] = [
  {
    sectionName: "my projects",
    menuItems: [
      {
        Icon: NewAgentIcon,
        name: "agents",
        route: "/agents",
        permissions: ["TD"],
        type: ["Commercial", "Enterprise"],
      },
      {
        Icon: FileBoxIcon,
        name: "AI Models",
        route: "/ai-models",
        permissions: ["TD"],
        type: ["Commercial", "Enterprise"],
      },
      {
        Icon: LibraryIcon,
        name: "Library",
        route: "/library",
        permissions: ["TD"],
        type: ["Commercial", "Enterprise"],
      },
    ],
  },
  {
    sectionName: "Orchestrator",
    menuItems: [
      {
        permissions: ["OM"],
        Icon: NewAgentIcon,
        name: "Published",
        route: "/orchestrator/published-agents",
        type: ["Commercial", "Enterprise"],
      },
      {
        permissions: ["OM"],
        Icon: DesktopIcon,
        name: "machines",
        route: "/orchestrator/machines",
        type: ["Commercial", "Enterprise"],
      },
      {
        permissions: ["OM"],
        Icon: QueueListIcon,
        name: "queues",
        route: "/orchestrator/queues",
        type: ["Commercial"],
      },
      {
        permissions: ["OM"],
        Icon: AiOutlineThunderbolt,
        name: "triggers",
        route: "/orchestrator/triggers",
        type: ["Commercial", "Enterprise"],
      },
      {
        permissions: ["OM"],
        Icon: MonitorPlayIcon,
        name: "Jobs",
        route: "/orchestrator/jobs",
        type: ["Commercial", "Enterprise"],
      },
      {
        permissions: ["OM"],
        Icon: NewChatIcon,
        name: "Conversations",
        route: "/orchestrator/conversations",
        type: ["Commercial", "Enterprise"],
      },
      {
        permissions: ["OM"],
        Icon: FolderCogIcon,
        name: "Key Store",
        route: "/orchestrator/keystore",
        type: ["Commercial", "Enterprise"],
      },
      {
        permissions: ["OM"],
        Icon: Shield,
        name: "Vault",
        route: "/orchestrator/vault",
        type: ["Commercial", "Enterprise"],
      },
      {
        permissions: ["OM"],
        Icon: BookOpenCheckIcon,
        name: "knowledge bases",
        route: "/orchestrator/knowledge-base",
        type: ["Commercial", "Enterprise"],
      },
    ],
  },
  {
    sectionName: "Assist",
    menuItems: IS_TAURI
      ? [
          {
            permissions: ["TU"],
            Icon: NewAgentIcon,
            name: "agents",
            route: "/assist/agents",
            type: ["Commercial", "Enterprise"],
          },

          // Add Assist queues only if not production
          ...(import.meta.env.MODE !== "production"
            ? ([
                {
                  permissions: ["TU"],
                  Icon: QueueListIcon,
                  name: "queues",
                  route: "/assist/queues",
                  type: ["Commercial", "Enterprise"],
                },
              ] as SidebarMenuItemExtended[])
            : []),
          // Add Assist chats only if not production
          ...(import.meta.env.MODE !== "production"
            ? ([
                {
                  permissions: ["TU"],
                  Icon: QueueListIcon,
                  name: "chats",
                  route: "/assist/chats",
                  type: ["Commercial", "Enterprise"],
                },
              ] as SidebarMenuItemExtended[])
            : []),
        ]
      : [
          // In dev show assist section in both web and taruri
          ...(import.meta.env.MODE !== "production"
            ? ([
                {
                  permissions: ["TU"],
                  Icon: NewAgentIcon,
                  name: "agents",
                  route: "/assist/agents",
                  type: ["Commercial", "Enterprise"],
                },
                {
                  permissions: ["TU"],
                  Icon: QueueListIcon,
                  name: "queues",
                  route: "/assist/queues",
                  type: ["Commercial", "Enterprise"],
                },
                {
                  permissions: ["TU"],
                  Icon: NewChatIcon,
                  name: "chats",
                  route: "/assist/chats",
                  type: ["Commercial", "Enterprise"],
                },
              ] as SidebarMenuItemExtended[])
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
        type: ["Commercial"],
      },
      {
        permissions: ["TA"],
        Icon: IdentificationIcon,
        name: "preferences",
        route: "/preferences",
        type: ["Enterprise"],
      },
      // Add integrations only if not production
      ...(import.meta.env.MODE !== "production"
        ? ([
            {
              permissions: ["TA"],
              Icon: Workflow,
              name: "integrations",
              route: "/integrations",
              type: ["Commercial", "Enterprise"],
            },
          ] as SidebarMenuItemExtended[])
        : []),
      {
        permissions: ["TA"],
        Icon: ServerIcon,
        name: "on-prem models",
        route: "/on-prem-models",
        type: ["Commercial", "Enterprise"],
      },
      {
        permissions: ["TA"],
        Icon: Wallet,
        name: "Usage",
        route: "/usage",
        type: ["Commercial"],
      },
      {
        permissions: ["TA"],
        Icon: CheckCheckIcon,
        name: "Approvals",
        route: "/approvals",
        type: ["Commercial", "Enterprise"],
      },
      {
        permissions: ["TA"],
        Icon: UsersIcon,
        name: "users",
        route: "/users",
        type: ["Commercial", "Enterprise"],
      },
      {
        permissions: ["TA"],
        Icon: ArchiveIcon,
        name: "archive",
        route: "/archive",
        type: ["Commercial", "Enterprise"],
      },
      {
        permissions: ["TA"],
        Icon: QuestionMarkCircleIcon,
        name: "support",
        route: "/supportticket",
        type: ["Commercial"],
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
        route: "/sa/tenants",
        type: ["Commercial"],
      },
      // {
      //   permissions: ["SA"],
      //   Icon: UsersIcon,
      //   name: "users",
      //   route: "/users",
      //   type: ["Commercial"],
      // },
      {
        permissions: ["SA"],
        Icon: CheckCheckIcon,
        name: "Approvals",
        route: "/sa/approvals",
        type: ["Commercial"],
      },
      {
        permissions: ["SA"],
        Icon: BadgeDollarSignIcon,
        name: "subscription plans",
        route: "/sa/subscription-plans",
        type: ["Commercial"],
      },
      {
        permissions: ["SA"],
        Icon: BanknotesIcon,
        name: "Credit Plans",
        route: "/sa/credit-plans",
        type: ["Commercial"],
      },
      // {
      //   permissions: ["SA"],
      //   Icon: ChartPieIcon,
      //   name: "Tenants Consumption",
      //   route: "/sa/tenants-consumption",
      //   type: ["Commercial"],
      // },
    ],
  },
  {
    sectionName: "Global Admin",
    menuItems: [
      {
        permissions: ["SA"],
        Icon: IdentificationIcon,
        name: "On-prem Tenants",
        route: "/ga/on-prem-tenants",
        type: ["Commercial"],
      },
    ],
  },
];

// TODO: Refactor this function to use a more efficient method of checking permissions
// TODO: This function filters the sidebar menu sections based on the user's roles for now.

export function getSidebarMenuBasedOnPermissions(
  userRoles: string[],
  deploymentType: deploymentType,
): SidebarMenuSectionExtended[] {
  return sidebarMenuSections
    .map((section) => {
      // Filter menuItems based on item-level permissions (if present)
      const filteredMenuItems = section.menuItems.filter(
        (item) =>
          (!item.permissions ||
            item.permissions.some((role) => userRoles.includes(role))) &&
          item.type?.includes(deploymentType),
      );

      // Only return the section if it has at least one visible menu item
      if (filteredMenuItems.length === 0) return null;

      return {
        ...section,
        menuItems: filteredMenuItems,
      };
    })
    .filter(
      (section): section is SidebarMenuSectionExtended => section !== null,
    );
}

export function flattenMenuRoutes(
  sections: SidebarMenuSectionExtended[],
): string[] {
  return sections.flatMap((section) =>
    section.menuItems.flatMap((item) => [
      item.route,
      ...(item.subMenuItems?.map((sub) => sub.route) ?? []),
    ]),
  );
}
