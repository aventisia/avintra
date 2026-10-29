import { DeploymentType, SidebarMenuItemType, SidebarMenuSectionType } from "@avplatform/ui/types";
import { DesktopIcon } from "@radix-ui/react-icons";
import {
  ArchiveIcon,
  BadgeDollarSignIcon,
  BanknoteIcon,
  BellIcon,
  BookOpenCheckIcon,
  CheckCheckIcon,
  CircleHelpIcon,
  Cpu,
  FolderCogIcon,
  IdCardIcon,
  KeySquareIcon,
  LibraryIcon,
  ListIcon,
  MonitorPlayIcon,
  PuzzleIcon,
  Shield,
  ShieldCheck,
  UsersIcon,
  Wallet,
  Workflow,
  WrenchIcon,
} from "lucide-react";
import { AiOutlineThunderbolt } from "react-icons/ai";

import { EnvironmentToggle } from "@/features/02-configure/components/EnvironmentToggle";

import NewAgentIcon from "../NewAgentIcon";
import NewChatIcon from "../NewChatIcon";

const sidebarMenuSections: SidebarMenuSectionType[] = [
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
        Icon: LibraryIcon,
        name: "Library",
        route: "/library",
        permissions: ["TD"],
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
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["OM", "TD"],
        Icon: AiOutlineThunderbolt,
        name: "Triggers",
        route: "/configure/triggers",
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
        Icon: FolderCogIcon,
        name: "Key store",
        route: "/configure/configstore",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["OM", "TD"],
        Icon: Shield,
        name: "Vault",
        route: "/configure/vault",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["OM", "TD"],
        Icon: BookOpenCheckIcon,
        name: "Knowledge bases",
        route: "/configure/knowledge-base",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["OM", "TD"],
        Icon: PuzzleIcon,
        name: "Skills",
        route: "/configure/skill-registry",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["OM", "TD"],
        Icon: WrenchIcon,
        name: "Tools",
        route: "/configure/tools",
        type: ["Commercial", "Enterprise", "Community"],
      },
    ],
    sectionHeaderAction: EnvironmentToggle,
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
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["OM"],
        Icon: ShieldCheck,
        name: "Agent risk registry",
        route: "/orchestrator/agent-risk-registry",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["OM"],
        Icon: DesktopIcon,
        name: "Machines",
        route: "/orchestrator/machines",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["OM"],
        Icon: MonitorPlayIcon,
        name: "Jobs",
        route: "/orchestrator/jobs",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["OM"],
        Icon: NewChatIcon,
        name: "Conversations",
        route: "/orchestrator/conversations",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["OM"],
        Icon: KeySquareIcon,
        name: "API keys",
        route: "/orchestrator/api-keys",
        type: ["Commercial", "Enterprise", "Community"],
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
        name: "Agents",
        route: "/assist/agents",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["TU"],
        Icon: ListIcon,
        name: "Queues",
        route: "/assist/queues",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["TU"],
        Icon: NewChatIcon,
        name: "Chats",
        route: "/assist/chats",
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
        Icon: BookOpenCheckIcon,
        name: "Get started",
        route: "/tenant/get-started",
        type: ["Commercial", "Enterprise", "Community"],
        hideWhenOnboardingComplete: true,
      },
      {
        permissions: ["TA"],
        Icon: IdCardIcon,
        name: "Tenant",
        route: "/tenant/overview",
        type: ["Commercial"],
      },
      {
        permissions: ["TA"],
        Icon: UsersIcon,
        name: "Users",
        route: "/tenant/users",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["TA"],
        Icon: FolderCogIcon,
        name: "Spaces",
        route: "/tenant/spaces",
        type: ["Commercial", "Enterprise", "Community"],
      },
      // Add integrations only if not production
      ...(import.meta.env.MODE !== "production"
        ? ([
            {
              permissions: ["TA"],
              Icon: Workflow,
              name: "Integrations",
              route: "/tenant/integrations",
              type: ["Commercial", "Enterprise", "Community"],
            },
          ] as SidebarMenuItemType[])
        : []),
      {
        permissions: ["TA"],
        Icon: Cpu,
        name: "Models",
        route: "/tenant/model-providers",
        type: ["Commercial", "Enterprise", "Community"],
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
        type: ["Commercial", "Enterprise", "Community"],
      },
      // Add notifications menu item for tenant admin
      {
        permissions: ["TA"],
        Icon: BellIcon,
        name: "Notifications",
        route: "/tenant/notifications",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["TA"],
        Icon: ArchiveIcon,
        name: "Archive",
        route: "/tenant/archive",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["TA"],
        Icon: IdCardIcon,
        name: "Preferences",
        route: "/tenant/preferences", // Only applicabe in case of enterprise and community deployment
        type: ["Enterprise", "Community"],
      },
      {
        permissions: ["TA"],
        Icon: CircleHelpIcon,
        name: "Support",
        route: "/tenant/support/tickets",
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
        Icon: IdCardIcon,
        name: "Tenants",
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
      {
        permissions: ["SA"],
        Icon: BellIcon,
        name: "Notifications",
        route: "/sa/notifications",
        type: ["Commercial", "Enterprise"],
      },

      {
        permissions: ["SA"],
        Icon: BadgeDollarSignIcon,
        name: "Subscription plans",
        route: "/sa/subscription-plans",
        type: ["Commercial"],
      },
      {
        permissions: ["SA"],
        Icon: BanknoteIcon,
        name: "Credit plans",
        route: "/sa/credit-plans",
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
        Icon: CircleHelpIcon,
        name: "Support",
        route: "/sa/support/tickets",
        type: ["Commercial"],
      },
    ],
  },
  {
    // sectionInternalName: globalAdmin
    sectionName: "Global admin",
    menuItems: [
      {
        permissions: ["SA"],
        Icon: IdCardIcon,
        name: "On-prem tenants",
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
  isOnboardingComplete = false,
): SidebarMenuSectionType[] {
  return sidebarMenuSections
    .map((section) => {
      // Filter menuItems based on item-level permissions (if present)
      const filteredMenuItems = section.menuItems.filter(
        (item) =>
          (!item.permissions || item.permissions.some((role) => userRoles.includes(role))) &&
          item.type?.includes(deploymentType) &&
          // Hide the Get Started item once the user has completed onboarding.
          !(item.hideWhenOnboardingComplete && isOnboardingComplete),
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
