import { CollapsedMenuItem, SidebarMenuItem } from "@avplatform/layout";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { HouseIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { HOME_CHAT_CONVERSATION_ROUTE, useIsHomeChatAvailable } from "@/features/home-chat";

import { sidebarHubs } from "./sidebar-hubs.constant";
import { getHubRoutes } from "./sidebar-hubs.util";

/**
 * Flat sidebar menu: Home when it's available, the items outside any hub, then one entry per hub the user can open.
 */
export const SidebarNav = () => {
  const { sidebarExpand, sections } = useBaseLayoutStore(
    useShallow((state) => ({
      sidebarExpand: state.sidebarExpand,
      sections: state.sidebarMenuSections ?? [],
    })),
  );

  const isHomeChatAvailable = useIsHomeChatAvailable();
  const MenuItem = sidebarExpand ? SidebarMenuItem : CollapsedMenuItem;
  const items = sections.flatMap((section) => section.menuItems).filter((item) => !item.hub);
  const hubEntries = sidebarHubs
    .map((hub) => ({ hub, routes: getHubRoutes(sections, hub.id) }))
    .filter(({ routes }) => routes.length > 0);

  return (
    <div className="flex flex-col gap-px px-2.5">
      {isHomeChatAvailable && (
        <MenuItem
          Icon={HouseIcon}
          name="Home"
          route="/"
          activeRoutes={["/", HOME_CHAT_CONVERSATION_ROUTE]}
        />
      )}
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
