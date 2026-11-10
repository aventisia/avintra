import { cn } from "@avplatform/ui/lib";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { isRouteWithin } from "@avplatform/ui/utils";
import { NavLink, useLocation } from "react-router-dom";

import { adminHubs, sidebarHubs } from "./sidebar-hubs.constant";
import { getHubRoutes, getHubSections } from "./sidebar-hubs.util";

const HUB_LINK_CLASS_NAME =
  "flex h-8 items-center rounded-sm px-2 text-body-sm text-ink-2 transition-colors duration-[120ms] ease-out hover:bg-hover hover:text-ink focus-visible:shadow-focus focus-visible:outline-none aria-[current=page]:bg-fill aria-[current=page]:font-semibold aria-[current=page]:text-ink motion-reduce:transition-none";

/**
 * Menu of the hub that holds the current page, grouped by its sections; renders nothing
 * outside a hub.
 */
export const HubNav = () => {
  const sections = useBaseLayoutStore((state) => state.sidebarMenuSections) ?? [];
  const { pathname } = useLocation();

  const hub = [...sidebarHubs, ...adminHubs].find((candidate) =>
    getHubRoutes(sections, candidate.id).some((route) => isRouteWithin(pathname, route)),
  );
  if (!hub) return null;

  return (
    <nav
      aria-label={hub.name}
      className="hidden w-52 shrink-0 flex-col overflow-y-auto border-r border-line px-2.5 pb-3 md:flex"
    >
      {getHubSections(sections, hub.id).map(
        ({ sectionName, menuItems, sectionHeaderAction: SectionHeaderAction }) => (
          <div key={sectionName} className="flex flex-col gap-px">
            <h3 className="flex h-[34px] items-end justify-between gap-2 whitespace-nowrap px-2 pb-[5px] font-mono text-label uppercase text-muted-foreground">
              {sectionName}
              {SectionHeaderAction && (
                <span className="-mb-[5px] flex">
                  <SectionHeaderAction />
                </span>
              )}
            </h3>
            {menuItems.map((item) => (
              <div key={item.route} className="flex flex-col gap-px">
                <NavLink to={item.route} end={!!item.subMenuItems} className={HUB_LINK_CLASS_NAME}>
                  {item.name}
                </NavLink>
                {item.subMenuItems?.map((subItem) => (
                  <NavLink
                    key={subItem.route}
                    to={subItem.route}
                    className={cn(HUB_LINK_CLASS_NAME, "pl-5")}
                  >
                    {subItem.name}
                  </NavLink>
                ))}
              </div>
            ))}
          </div>
        ),
      )}
    </nav>
  );
};
