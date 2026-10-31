import type { SidebarMenuSectionType } from "@avplatform/ui/types";

import type { HubId } from "./sidebar-hub.type";
import { flattenMenuRoutes } from "./sidebar-menu-sections";

/** The sections that hold items of the hub, each keeping only those items. */
export function getHubSections(
  sections: SidebarMenuSectionType[],
  hubId: HubId,
): SidebarMenuSectionType[] {
  return sections
    .map((section) => ({
      ...section,
      menuItems: section.menuItems.filter((item) => item.hub === hubId),
    }))
    .filter((section) => section.menuItems.length > 0);
}

/** Every route, sub-menu routes included, of the hub's items, in menu order. */
export function getHubRoutes(sections: SidebarMenuSectionType[], hubId: HubId): string[] {
  return flattenMenuRoutes(getHubSections(sections, hubId));
}
