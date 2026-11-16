import { CollapsedMenuItem, SidebarMenuItem } from "@avplatform/layout";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { Tooltip } from "@avplatform/ui/tooltip";
import { ClockCounterClockwiseIcon, PlusIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { HomeChatSidebarSection, useIsHomeChatAvailable } from "@/features/home-chat";

import { sidebarHubs } from "./sidebar-hubs.constant";
import { getHubRoutes } from "./sidebar-hubs.util";

/**
 * Flat sidebar menu: New (a new Home chat) when Home chat is available, the items outside any hub,
 * one entry per hub the user can open, then the user's chats below a divider.
 */
export const SidebarNav = () => {
  const { sidebarExpand, setSidebarExpand, sections } = useBaseLayoutStore(
    useShallow((state) => ({
      sidebarExpand: state.sidebarExpand,
      setSidebarExpand: state.setSidebarExpand,
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
      {isHomeChatAvailable && <MenuItem Icon={PlusIcon} name="New" route="/" />}
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
      {isHomeChatAvailable &&
        (sidebarExpand ? (
          <HomeChatSidebarSection />
        ) : (
          <>
            <hr className="mx-auto my-2 w-6 border-line" />
            <Tooltip content="Show chats" side="right">
              <button
                type="button"
                aria-label="Show chats"
                onClick={() => setSidebarExpand(true)}
                className="mx-auto my-0.5 flex size-9 items-center justify-center rounded-sm text-muted-foreground transition-colors duration-[120ms] ease-out hover:bg-hover hover:text-ink focus-visible:shadow-focus focus-visible:outline-none motion-reduce:transition-none"
              >
                <ClockCounterClockwiseIcon className="size-4 stroke-[1.75]" />
              </button>
            </Tooltip>
          </>
        ))}
    </div>
  );
};
