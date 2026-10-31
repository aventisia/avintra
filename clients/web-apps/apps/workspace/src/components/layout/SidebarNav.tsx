import { CollapsedMenuItem, SidebarMenuItem } from "@avplatform/layout";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { useShallow } from "zustand/react/shallow";

import { sidebarHubs } from "./sidebar-hubs.constant";
import { getHubRoutes } from "./sidebar-hubs.util";

/**
 * Flat sidebar menu: the items outside any hub, then one entry per hub the user can open.
 */
export const SidebarNav = () => {
  const { sidebarExpand, sections } = useBaseLayoutStore(
    useShallow((state) => ({
      sidebarExpand: state.sidebarExpand,
      sections: state.sidebarMenuSections ?? [],
    })),
  );

  const MenuItem = sidebarExpand ? SidebarMenuItem : CollapsedMenuItem;
  const items = sections.flatMap((section) => section.menuItems).filter((item) => !item.hub);
  const hubEntries = sidebarHubs
    .map((hub) => ({ hub, routes: getHubRoutes(sections, hub.id) }))
    .filter(({ routes }) => routes.length > 0);

  return (
    <div className="flex flex-col gap-px px-2.5">
      {items.map((item) => (
        <MenuItem key={item.route} Icon={item.Icon} name={item.name} route={item.route} />
      ))}
      {hubEntries.map(({ hub, routes }) => (
        <MenuItem
          key={hub.id}
          Icon={hub.Icon}
          name={hub.name}
          route={routes[0]}
          activeRoutes={routes}
        />
      ))}
    </div>
  );
};
