import { DeploymentType, SidebarMenuItemType, SidebarMenuSectionType } from "@avplatform/ui/types";
import {
  ArchiveIcon,
  BellIcon,
  BookOpenTextIcon,
  BooksIcon,
  ChecksIcon,
  CpuIcon,
  CurrencyCircleDollarIcon,
  DesktopIcon,
  FileTextIcon,
  FlowArrowIcon,
  FolderSimpleUserIcon,
  IdentificationCardIcon,
  LightningIcon,
  ListIcon,
  MoneyIcon,
  MonitorPlayIcon,
  PasswordIcon,
  PuzzlePieceIcon,
  QuestionIcon,
  ShieldCheckIcon,
  ShieldIcon,
  UsersIcon,
  WalletIcon,
  WrenchIcon,
} from "@phosphor-icons/react";

import { EnvironmentToggle } from "@/features/02-configure/components/EnvironmentToggle";

import NewAgentIcon from "../NewAgentIcon";
import NewChatIcon from "../NewChatIcon";
import type { HubId } from "./sidebar-hub.type";

const sidebarMenuSections: SidebarMenuSectionType<HubId>[] = [
  {
    // sectionInternalName: build
    sectionName: "Build",
    menuItems: [
      {
        Icon: NewAgentIcon,
        name: "Agents",
        route: "/agents",
        permissions: ["TD"],
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        Icon: BooksIcon,
        name: "Library",
        route: "/library",
        permissions: ["TD"],
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["TU"],
        Icon: FileTextIcon,
        name: "Artifacts",
        route: "/assist/artifacts",
        type: ["Commercial", "Enterprise", "Community"],
      },
    ],
  },
  {
    // sectionInternalName: configure
    sectionName: "Configure",
    menuItems: [
      {
        permissions: ["OM", "TD"],
        Icon: ListIcon,
        name: "Queues",
        route: "/configure/queues",
        hub: "configure",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["OM", "TD"],
        Icon: LightningIcon,
        name: "Triggers",
        route: "/configure/triggers",
        hub: "configure",
        type: ["Commercial", "Enterprise", "Community"],
        subMenuItems: [
          {
            name: "Time",
            route: "/configure/triggers/time",
            permissions: ["OM", "TD"],
          },
          {
            name: "Email",
            route: "/configure/triggers/email",
            permissions: ["OM", "TD"],
          },
          {
            name: "Message",
            route: "/configure/triggers/message",
            permissions: ["OM", "TD"],
          },
          {
            name: "Webhook",
            route: "/configure/triggers/webhook",
            permissions: ["OM", "TD"],
          },
        ],
      },
      {
        permissions: ["OM", "TD"],
        Icon: FolderSimpleUserIcon,
        name: "Key store",
        route: "/configure/configstore",
        hub: "configure",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["OM", "TD"],
        Icon: ShieldIcon,
        name: "Vault",
        route: "/configure/vault",
        hub: "configure",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["OM", "TD"],
        Icon: BookOpenTextIcon,
        name: "Knowledge bases",
        route: "/configure/knowledge-base",
        hub: "configure",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["OM", "TD"],
        Icon: PuzzlePieceIcon,
        name: "Skills",
        route: "/configure/skill-registry",
        hub: "configure",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["OM", "TD"],
        Icon: WrenchIcon,
        name: "Tools",
        route: "/configure/tools",
        hub: "configure",
        type: ["Commercial", "Enterprise", "Community"],
      },
    ],
    sectionHeaderAction: EnvironmentToggle,
  },
  {
    // sectionInternalName: assist
    sectionName: "Assist",
    menuItems: [
      {
        permissions: ["TU"],
        Icon: NewAgentIcon,
        name: "Agents",
        route: "/assist/agents",
        hub: "assist",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["TU"],
        Icon: ListIcon,
        name: "Queues",
        route: "/assist/queues",
        hub: "assist",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["TU"],
        Icon: NewChatIcon,
        name: "Chats",
        route: "/assist/chats",
        hub: "assist",
        type: ["Commercial", "Enterprise", "Community"],
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
        hub: "orchestrator",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["OM"],
        Icon: ShieldCheckIcon,
        name: "Agent risk registry",
        route: "/orchestrator/agent-risk-registry",
        hub: "orchestrator",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["OM"],
        Icon: DesktopIcon,
        name: "Machines",
        route: "/orchestrator/machines",
        hub: "orchestrator",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["OM"],
        Icon: MonitorPlayIcon,
        name: "Jobs",
        route: "/orchestrator/jobs",
        hub: "orchestrator",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["OM"],
        Icon: NewChatIcon,
        name: "Conversations",
        route: "/orchestrator/conversations",
        hub: "orchestrator",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["OM"],
        Icon: PasswordIcon,
        name: "API keys",
        route: "/orchestrator/api-keys",
        hub: "orchestrator",
        type: ["Commercial", "Enterprise", "Community"],
      },
    ],
  },
  {
    // sectionInternalName: tenantAdmin
    sectionName: "Tenant admin",
    menuItems: [
      {
        permissions: ["TA"],
        Icon: IdentificationCardIcon,
        name: "Tenant",
        route: "/tenant/overview",
        hub: "admin",
        type: ["Commercial"],
      },
      {
        permissions: ["TA"],
        Icon: UsersIcon,
        name: "Users",
        route: "/tenant/users",
        hub: "admin",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["TA"],
        Icon: FolderSimpleUserIcon,
        name: "Spaces",
        route: "/tenant/spaces",
        hub: "admin",
        type: ["Commercial", "Enterprise", "Community"],
      },
      // Add integrations only if not production
      ...(import.meta.env.MODE !== "production"
        ? ([
            {
              permissions: ["TA"],
              Icon: FlowArrowIcon,
              name: "Integrations",
              route: "/tenant/integrations",
              hub: "admin",
              type: ["Commercial", "Enterprise", "Community"],
            },
          ] as SidebarMenuItemType<HubId>[])
        : []),
      {
        permissions: ["TA"],
        Icon: CpuIcon,
        name: "Models",
        route: "/tenant/model-providers",
        hub: "admin",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["TA"],
        Icon: WalletIcon,
        name: "Usage",
        route: "/tenant/usage",
        hub: "admin",
        type: ["Commercial"],
      },
      {
        permissions: ["TA"],
        Icon: ChecksIcon,
        name: "Approvals",
        route: "/tenant/approvals",
        hub: "admin",
        type: ["Commercial", "Enterprise", "Community"],
      },
      // Add notifications menu item for tenant admin
      {
        permissions: ["TA"],
        Icon: BellIcon,
        name: "Notifications",
        route: "/tenant/notifications",
        hub: "admin",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["TA"],
        Icon: ArchiveIcon,
        name: "Archive",
        route: "/tenant/archive",
        hub: "admin",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["TA"],
        Icon: IdentificationCardIcon,
        name: "Preferences",
        route: "/tenant/preferences", // Only applicabe in case of enterprise and community deployment
        hub: "admin",
        type: ["Enterprise", "Community"],
      },
      {
        permissions: ["TA"],
        Icon: QuestionIcon,
        name: "Support",
        route: "/tenant/support/tickets",
        hub: "admin",
        type: ["Commercial"],
      },
    ],
  },
  {
    // sectionInternalName: superAdmin
    sectionName: "Multi-tenant admin",
    menuItems: [
      {
        permissions: ["SA"],
        Icon: IdentificationCardIcon,
        name: "Tenants",
        route: "/sa/tenants",
        hub: "multi-tenant",
        type: ["Commercial"],
      },
      {
        permissions: ["SA"],
        Icon: ChecksIcon,
        name: "Approvals",
        route: "/sa/approvals",
        hub: "multi-tenant",
        type: ["Commercial"],
      },
      {
        permissions: ["SA"],
        Icon: BellIcon,
        name: "Notifications",
        route: "/sa/notifications",
        hub: "multi-tenant",
        type: ["Commercial", "Enterprise"],
      },

      {
        permissions: ["SA"],
        Icon: CurrencyCircleDollarIcon,
        name: "Subscription plans",
        route: "/sa/subscription-plans",
        hub: "multi-tenant",
        type: ["Commercial"],
      },
      {
        permissions: ["SA"],
        Icon: MoneyIcon,
        name: "Credit plans",
        route: "/sa/credit-plans",
        hub: "multi-tenant",
        type: ["Commercial"],
      },
      // {
      //   permissions: ["SA"],
      //   Icon: ChartPieIcon,
      //   name: "Tenants consumption",
      //   route: "/sa/tenants-consumption",
      //   type: ["Commercial"],
      // },
      {
        permissions: ["SA"],
        Icon: QuestionIcon,
        name: "Support",
        route: "/sa/support/tickets",
        hub: "multi-tenant",
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
): SidebarMenuSectionType<HubId>[] {
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
    .filter((section): section is SidebarMenuSectionType<HubId> => section !== null);
}

export function flattenMenuRoutes(sections: SidebarMenuSectionType[]): string[] {
  return sections.flatMap((section) =>
    section.menuItems.flatMap((item) => [
      item.route,
      ...(item.subMenuItems?.map((sub) => sub.route) ?? []),
    ]),
  );
}
