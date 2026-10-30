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
  ShieldCheck,
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
    sectionName: "build",
    menuItems: [
      {
        Icon: NewAgentIcon,
        name: "agents",
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
    sectionName: "configure",
    menuItems: [
      {
        permissions: ["OM", "TD"],
        Icon: QueueListIcon,
        name: "queues",
        route: "/configure/queues",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["OM", "TD"],
        Icon: AiOutlineThunderbolt,
        name: "triggers",
        route: "/configure/triggers",
        type: ["Commercial", "Enterprise", "Community"],
        subMenuItems: [
          {
            name: "time",
            route: "/configure/triggers/time",
            permissions: ["OM", "TD"],
          },
          {
            name: "email",
            route: "/configure/triggers/email",
            permissions: ["OM", "TD"],
          },
          {
            name: "message",
            route: "/configure/triggers/message",
            permissions: ["OM", "TD"],
          },
          {
            name: "webhook",
            route: "/configure/triggers/webhook",
            permissions: ["OM", "TD"],
          },
        ],
      },
      {
        permissions: ["OM", "TD"],
        Icon: FolderCogIcon,
        name: "Key Store",
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
        name: "knowledge bases",
        route: "/configure/knowledge-base",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["OM", "TD"],
        Icon: PuzzleIcon,
        name: "skills",
        route: "/configure/skill-registry",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["OM", "TD"],
        Icon: WrenchIcon,
        name: "tools",
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
        name: "Agent Risk Registry",
        route: "/orchestrator/agent-risk-registry",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["OM"],
        Icon: DesktopIcon,
        name: "machines",
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
        name: "API Keys",
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
        name: "agents",
        route: "/assist/agents",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["TU"],
        Icon: QueueListIcon,
        name: "queues",
        route: "/assist/queues",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["TU"],
        Icon: NewChatIcon,
        name: "chats",
        route: "/assist/chats",
        type: ["Commercial", "Enterprise", "Community"],
      },
    ],
  },
  {
    // sectionInternalName: tenantAdmin
    sectionName: "Tenant Admin",
    menuItems: [
      {
        permissions: ["TA"],
        Icon: BookOpenCheckIcon,
        name: "Get Started",
        route: "/tenant/get-started",
        type: ["Commercial", "Enterprise", "Community"],
        hideWhenOnboardingComplete: true,
      },
      {
        permissions: ["TA"],
        Icon: IdentificationIcon,
        name: "tenant",
        route: "/tenant/overview",
        type: ["Commercial"],
      },
      {
        permissions: ["TA"],
        Icon: UsersIcon,
        name: "users",
        route: "/tenant/users",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["TA"],
        Icon: FolderCogIcon,
        name: "spaces",
        route: "/tenant/spaces",
        type: ["Commercial", "Enterprise", "Community"],
      },
      // Add integrations only if not production
      ...(import.meta.env.MODE !== "production"
        ? ([
            {
              permissions: ["TA"],
              Icon: Workflow,
              name: "integrations",
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
        name: "notifications",
        route: "/tenant/notifications",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["TA"],
        Icon: ArchiveIcon,
        name: "archive",
        route: "/tenant/archive",
        type: ["Commercial", "Enterprise", "Community"],
      },
      {
        permissions: ["TA"],
        Icon: IdentificationIcon,
        name: "preferences",
        route: "/tenant/preferences", // Only applicabe in case of enterprise and community deployment
        type: ["Enterprise", "Community"],
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
    sectionName: "Multi-Tenant Admin",
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
      {
        permissions: ["SA"],
        Icon: BellIcon,
        name: "notifications",
        route: "/sa/notifications",
        type: ["Commercial", "Enterprise"],
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
        // IMPORTANT NOTE: GlobalAdmin is a separate app; an absolute URL makes the shared
        // sidebar leave the Workspace router instead of resolving this path inside it.
        route: new URL(
          `${import.meta.env.VITE_GLOBALADMIN_PATH}on-prem-tenants`,
          window.location.origin,
        ).href,
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
