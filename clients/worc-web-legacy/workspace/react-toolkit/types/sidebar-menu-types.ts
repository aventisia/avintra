import {
  SidebarMenuItemType,
  SidebarMenuSectionType,
} from "@aventisia/ui/types";
import { deploymentType } from "./user-session-types";

export type SidebarMenuItemExtended = SidebarMenuItemType & {
  type?: deploymentType[];
};

export type SidebarMenuSectionExtended = Omit<
  SidebarMenuSectionType,
  "menuItems"
> & {
  menuItems: SidebarMenuItemExtended[];
};
