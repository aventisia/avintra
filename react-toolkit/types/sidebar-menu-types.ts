import {
  SidebarMenuItemType,
  SidebarMenuSectionType,
} from "@aventisia/ui/types";

export type deploymentType = "Commercial" | "Enterprise";

export type SidebarMenuItemExtended = SidebarMenuItemType & {
  type?: deploymentType[];
};

export type SidebarMenuSectionExtended = Omit<
  SidebarMenuSectionType,
  "menuItems"
> & {
  menuItems: SidebarMenuItemExtended[];
};
