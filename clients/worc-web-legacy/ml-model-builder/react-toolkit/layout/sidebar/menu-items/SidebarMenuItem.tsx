import { useBaseLayoutStore } from "@/react-toolkit/stores/base-layout-store";

import { IconProps } from "@aventisia/ui/types";
import { NavLink } from "react-router-dom";

interface SidebarMenuItemProps {
  Icon: React.ComponentType<IconProps>;
  name: string;
  route: string;
  badge?: string;
}

const SidebarMenuItem = ({
  Icon,
  name,
  route,
  badge,
}: SidebarMenuItemProps) => {
  const { navbarOnSheetOpen, setNavbarOnSheetOpen, sidebarExpand } =
    useBaseLayoutStore();

  function closeNavbarOnSheet() {
    if (navbarOnSheetOpen) {
      setNavbarOnSheetOpen(false);
    }
  }

  return (
    <div className={`${sidebarExpand ? "mx-3" : "mx-4"}`}>
      <NavLink
        to={route}
        className={({ isActive }) => {
          return isActive ? "active group rounded-lg" : "group rounded-lg";
        }}
        onClick={closeNavbarOnSheet}
      >
        <li className="group relative my-1.5 flex h-9 cursor-pointer items-center justify-between overflow-hidden rounded-lg border-0 pr-3.5 transition-[width] duration-500 hover:bg-accent hover:text-primary group-[.active]:bg-accent group-[.active]:text-primary">
          <span className="absolute block h-[45%] w-[0.18rem] rounded-full opacity-80 group-[.active]:bg-primary" />
          <div className="flex items-center justify-center">
            <div
              className={`mr-1 flex h-9 items-center justify-center ${
                sidebarExpand ? "w-[2.5rem]" : "w-9"
              }`}
            >
              <Icon className="h-5 w-5 text-[--icon-color] group-hover:text-primary group-[.active]:text-primary" />
            </div>
            <span
              className={`whitespace-nowrap text-sm font-medium capitalize tracking-wide ${
                sidebarExpand ? "block" : "hidden"
              }`}
            >
              {name}
            </span>
          </div>
          {badge && (
            <span
              className={`rounded-xl bg-slate-200 px-2.5 py-0.5 text-sm ${
                sidebarExpand ? "block" : "hidden"
              }`}
            >
              {badge}
            </span>
          )}
        </li>
      </NavLink>
    </div>
  );
};

export { SidebarMenuItem };
