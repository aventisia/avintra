import { DeploymentType, SidebarMenuItemType, SidebarMenuSectionType } from "@avplatform/ui/types";
import {
  BanknotesIcon,
  IdentificationIcon,
  QuestionMarkCircleIcon,
  QueueListIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { DesktopIcon } from "@radix-ui/react-icons";
import {
  ArchiveIcon,
  BadgeDollarSignIcon,
  BellIcon,
  BookOpenCheckIcon,
  CheckCheckIcon,
  Cpu,
  FolderCogIcon,
  KeySquareIcon,
  LibraryIcon,
  MonitorPlayIcon,
  PuzzleIcon,
  Shield,
  Wallet,
  Workflow,
  WrenchIcon,
} from "lucide-react";
import { AiOutlineThunderbolt } from "react-icons/ai";

import NewAgentIcon from "../NewAgentIcon";
import NewChatIcon from "../NewChatIcon";

const sidebarMenuSections: SidebarMenuSectionType[] = [
  {
    // sectionInternalName: build
    sectionName: "build",
    menuItems: [
      {
        Icon: NewAgentIcon,
        name: "agents",
        route: "/agents",
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
    // sectionInternalName: configure
    sectionName: "configure",
    menuItems: [
      {
        permissions: ["OM"],
        Icon: QueueListIcon,
        name: "queues",
        route: "/configure/queues",
        type: ["Commercial"],
      },
      {
        permissions: ["OM"],
        Icon: AiOutlineThunderbolt,
        name: "triggers",
        route: "/configure/triggers",
        type: ["Commercial", "Enterprise"],
        subMenuItems: [
          {
            name: "time",
            route: "/configure/triggers/time",
            permissions: ["OM"],
          },
          {
            name: "email",
            route: "/configure/triggers/email",
            permissions: ["OM"],
          },
          {
            name: "message",
            route: "/configure/triggers/message",
            permissions: ["OM"],
          },
          {
            name: "webhook",
            route: "/configure/triggers/webhook",
            permissions: ["OM"],
          },
        ],
      },
      {
        permissions: ["OM"],
        Icon: FolderCogIcon,
        name: "Key Store",
        route: "/configure/keystore",
        type: ["Commercial", "Enterprise"],
      },
      {
        permissions: ["OM"],
        Icon: Shield,
        name: "Vault",
        route: "/configure/vault",
        type: ["Commercial", "Enterprise"],
      },
      {
        permissions: ["OM"],
        Icon: BookOpenCheckIcon,
        name: "knowledge bases",
        route: "/configure/knowledge-base",
        type: ["Commercial", "Enterprise"],
      },
      {
        permissions: ["OM"],
        Icon: PuzzleIcon,
        name: "skills",
        route: "/configure/skills",
        type: ["Commercial", "Enterprise"],
      },
      {
        permissions: ["OM"],
        Icon: WrenchIcon,
        name: "tools",
        route: "/configure/tools",
        type: ["Commercial", "Enterprise"],
      },
    ],
  },
  {
    // sectionInternalName: orchestrator
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
        Icon: KeySquareIcon,
        name: "API Keys",
        route: "/orchestrator/api-keys",
        type: ["Commercial", "Enterprise"],
      },
    ],
  },
  {
    // sectionInternalName: assist
    sectionName: "Assist",
    menuItems: [
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
    ],
  },
  {
    // sectionInternalName: tenantAdmin
    sectionName: "Tenant Admin",
    menuItems: [
      {
        permissions: ["TA"],
        Icon: IdentificationIcon,
        name: "tenant",
        route: "/tenant/overview",
        type: ["Commercial"],
      },
      {
        permissions: ["TA"],
        Icon: IdentificationIcon,
        name: "preferences",
        route: "/tenant/preferences", // Only applicabe in case of enterprise deployment
        type: ["Enterprise"],
      },
      {
        permissions: ["TA"],
        Icon: UsersIcon,
        name: "users",
        route: "/tenant/users",
        type: ["Commercial", "Enterprise"],
      },
      {
        permissions: ["TA"],
        Icon: FolderCogIcon,
        name: "spaces",
        route: "/tenant/spaces",
        type: ["Commercial", "Enterprise"],
      },
      // Add integrations only if not production
      ...(import.meta.env.MODE !== "production"
        ? ([
            {
              permissions: ["TA"],
              Icon: Workflow,
              name: "integrations",
              route: "/tenant/integrations",
              type: ["Commercial", "Enterprise"],
            },
          ] as SidebarMenuItemType[])
        : []),
      {
        permissions: ["TA"],
        Icon: Cpu,
        name: "Models",
        route: "/tenant/model-providers",
        type: ["Commercial", "Enterprise"],
      },
      {
        permissions: ["TA"],
        Icon: Wallet,
        name: "Usage",
        route: "/tenant/usage",
        type: ["Commercial"],
      },
      {
        permissions: ["TA"],
        Icon: CheckCheckIcon,
        name: "Approvals",
        route: "/tenant/approvals",
        type: ["Commercial", "Enterprise"],
      },
      // Add integrations only if not production
      ...(import.meta.env.MODE !== "production"
        ? ([
            {
              permissions: ["TA"],
              Icon: BellIcon,
              name: "notifications",
              route: "/tenant/notifications",
              type: ["Commercial", "Enterprise"],
            },
          ] as SidebarMenuItemType[])
        : []),
      {
        permissions: ["TA"],
        Icon: ArchiveIcon,
        name: "archive",
        route: "/tenant/archive",
        type: ["Commercial", "Enterprise"],
      },
      {
        permissions: ["TA"],
        Icon: QuestionMarkCircleIcon,
        name: "support",
        route: "/tenant/support/tickets",
        type: ["Commercial"],
      },
    ],
  },
  {
    // sectionInternalName: superAdmin
    sectionName: "Super Admin",
    menuItems: [
      {
        permissions: ["SA"],
        Icon: IdentificationIcon,
        name: "tenants",
        route: "/sa/tenants",
        type: ["Commercial"],
      },
      {
        permissions: ["SA"],
        Icon: CheckCheckIcon,
        name: "Approvals",
        route: "/sa/approvals",
        type: ["Commercial"],
      },
      // Add integrations only if not production
      ...(import.meta.env.MODE !== "production"
        ? ([
            {
              permissions: ["SA"],
              Icon: BellIcon,
              name: "notifications",
              route: "/sa/notifications",
              type: ["Commercial", "Enterprise"],
            },
          ] as SidebarMenuItemType[])
        : []),

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
      {
        permissions: ["SA"],
        Icon: QuestionMarkCircleIcon,
        name: "support",
        route: "/sa/support/tickets",
        type: ["Commercial"],
      },
    ],
  },
  {
    // sectionInternalName: globalAdmin
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
  deploymentType: DeploymentType,
): SidebarMenuSectionType[] {
  return sidebarMenuSections
    .map((section) => {
      // Filter menuItems based on item-level permissions (if present)
      const filteredMenuItems = section.menuItems.filter(
        (item) =>
          (!item.permissions || item.permissions.some((role) => userRoles.includes(role))) &&
          item.type?.includes(deploymentType),
      );

      // Only return the section if it has at least one visible menu item
      if (filteredMenuItems.length === 0) return null;

      return {
        ...section,
        menuItems: filteredMenuItems,
      };
    })
    .filter((section): section is SidebarMenuSectionType => section !== null);
}

export function flattenMenuRoutes(sections: SidebarMenuSectionType[]): string[] {
  return sections.flatMap((section) =>
    section.menuItems.flatMap((item) => [
      item.route,
      ...(item.subMenuItems?.map((sub) => sub.route) ?? []),
    ]),
  );
}
