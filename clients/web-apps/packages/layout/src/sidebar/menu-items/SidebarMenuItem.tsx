import { useBaseLayoutStore } from "@avplatform/ui/stores";
import type { IconProps } from "@avplatform/ui/types";
import { NavLink } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

interface SidebarMenuItemProps {
  Icon: React.ComponentType<IconProps>;
  name: string;
  route: string;
  badge?: string;
}

/**
 * SidebarMenuItem component renders a menu item for a sidebar with an optional badge.
 * It supports dynamic behavior based on the sidebar's expansion state and handles
 * navigation using `NavLink` from React Router.
 *
 * @component
 * @param {SidebarMenuItemProps} props - The props for the SidebarMenuItem component.
 * @param {React.ComponentType} props.Icon - The icon component to display for the menu item.
 * @param {string} props.name - The name of the menu item to display.
 * @param {string} props.route - The route path to navigate to when the menu item is clicked.
 * @param {string | number | undefined} [props.badge] - An optional badge to display alongside the menu item.
 *
 * @returns {JSX.Element} A JSX element representing a sidebar menu item.
 *
 * @remarks
 * - The component uses `useBaseLayoutStore` to manage the sidebar's state, including
 *   whether the sidebar is expanded and whether a dialog is open.
 * - The `closeSidebarOnDialog` function ensures the sidebar dialog is closed when
 *   the menu item is clicked.
 * - The component dynamically adjusts its styles and layout based on the `sidebarExpand` state.
 *
 * @example
 * ```tsx
 * <SidebarMenuItem
 *   Icon={SomeIcon}
 *   name="Dashboard"
 *   route="/dashboard"
 *   badge="3"
 * />
 * ```
 */
const SidebarMenuItem = ({ Icon, name, route, badge }: SidebarMenuItemProps) => {
  // Get the sidebarExpand and sidebarOnDialogOpen state from the base layout store
  const { sidebarOnDialogOpen, setSidebarOnDialogOpen, sidebarExpand } = useBaseLayoutStore(
    useShallow((state) => ({
      sidebarExpand: state.sidebarExpand,
      sidebarOnDialogOpen: state.sidebarOnDialogOpen,
      setSidebarOnDialogOpen: state.setSidebarOnDialogOpen,
    })),
  );

  // Function to close the sidebar dialog when a menu item is clicked
  function closeSidebarOnDialog() {
    if (sidebarOnDialogOpen) {
      setSidebarOnDialogOpen(false);
    }
  }

  // Return the sidebar menu item component
  return (
    <div className={`${sidebarExpand ? "mx-3" : "mx-4"}`}>
      <NavLink
        to={route}
        className={({ isActive }) => {
          return isActive ? "active group rounded-lg" : "group rounded-lg";
        }}
        onClick={closeSidebarOnDialog}
      >
        <li className="group relative my-1.5 flex h-9 cursor-pointer items-center justify-between overflow-hidden rounded-lg border-0 pr-3.5 transition-[width] duration-500 hover:bg-accent hover:text-primary group-[.active]:bg-accent group-[.active]:text-primary">
          <span className="absolute block h-[45%] w-[0.18rem] rounded-full opacity-80 group-[.active]:bg-secondary" />
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
