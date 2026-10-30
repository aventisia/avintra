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

  return (
    <NavLink
      to={route}
      onClick={closeSidebarOnDialog}
      className="group relative flex h-8 items-center gap-[9px] rounded-sm px-2 text-body-sm text-ink-2 transition-colors duration-[120ms] ease-out hover:bg-hover hover:text-ink focus-visible:shadow-focus focus-visible:outline-none aria-[current=page]:bg-fill aria-[current=page]:font-semibold aria-[current=page]:text-ink motion-reduce:transition-none"
    >
      <span className="absolute inset-y-1.5 left-0 hidden w-[3px] rounded-r-full bg-indicator group-aria-[current=page]:block" />
      <Icon className="size-4 shrink-0 stroke-[1.75] text-muted-foreground group-aria-[current=page]:text-ink" />
      <span className={`truncate ${sidebarExpand ? "block" : "hidden"}`}>{name}</span>
      {badge && (
        <span
          className={`ml-auto font-mono text-2xs leading-none text-muted-foreground ${
            sidebarExpand ? "block" : "hidden"
          }`}
        >
          {badge}
        </span>
      )}
    </NavLink>
  );
};

export { SidebarMenuItem };
