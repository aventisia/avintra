import { type DeploymentType, type IconProps } from "@/ui/types";

type SidebarMenuSectionType = {
  sectionName: string;
  menuItems: SidebarMenuItemType[];
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
