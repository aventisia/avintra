import { type DeploymentType, type IconProps } from "@/ui/types";

type SidebarMenuSectionType = {
  sectionName: string;
  menuItems: SidebarMenuItemType[];
  /**
   * Optional component rendered on the same line as the section header, aligned
   * to the right. Typically used for per-section controls (e.g. an environment
   * toggle next to the "configure" section). Only rendered while the sidebar is
   * expanded.
   */
  sectionHeaderAction?: React.ComponentType;
};

type SidebarMenuItemType = {
  permissions?: string[];
  Icon: React.ComponentType<IconProps>;
  name: string;
  route: string;
  badge?: string;
  subMenuItems?: SidebarSubMenuItemType[];
  type?: DeploymentType[];
};

type SidebarSubMenuItemType = {
  permissions?: string[];
  name: string;
  route: string;
};

export { type SidebarMenuItemType, type SidebarMenuSectionType, type SidebarSubMenuItemType };
