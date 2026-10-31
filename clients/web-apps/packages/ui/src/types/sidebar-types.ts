import { type DeploymentType, type IconProps } from "@/ui/types";

type SidebarMenuSectionType<THub extends string = string> = {
  sectionName: string;
  menuItems: SidebarMenuItemType<THub>[];
  /**
   * Optional component rendered on the same line as the section header, aligned
   * to the right. Typically used for per-section controls (e.g. an environment
   * toggle next to the "configure" section). Only rendered while the sidebar is
   * expanded.
   */
  sectionHeaderAction?: React.ComponentType;
};

type SidebarMenuItemType<THub extends string = string> = {
  permissions?: string[];
  Icon: React.ComponentType<IconProps>;
  name: string;
  route: string;
  badge?: string;
  subMenuItems?: SidebarSubMenuItemType[];
  type?: DeploymentType[];
  /**
   * When true, the item is hidden once the user has completed the Get Started
   * onboarding guide. Used for the Tenant Admin "Get Started" menu item.
   */
  hideWhenOnboardingComplete?: boolean;
  /**
   * Id of the hub that holds the item: the sidebar shows one entry for the hub instead of
   * the item, and the hub's pages list its items in their own menu.
   */
  hub?: THub;
};

type SidebarSubMenuItemType = {
  permissions?: string[];
  name: string;
  route: string;
};

export { type SidebarMenuItemType, type SidebarMenuSectionType, type SidebarSubMenuItemType };
