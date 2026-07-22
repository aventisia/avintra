import { HoverCard, HoverCardContent, HoverCardTrigger } from "@avplatform/ui/hover-card";
import type { IconProps } from "@avplatform/ui/types";
import { NavLink } from "react-router-dom";

interface MenuItemProps {
  Icon: React.ComponentType<IconProps>;
  name: string;
  route: string;
}

/**
 * A functional component that renders a collapsible menu item with an icon and a hoverable tooltip.
 * The component uses `HoverCard` for displaying additional information when hovered over.
 *
 * @param {MenuItemProps} props - The properties for the `CollapsedMenuItem` component.
 * @param {React.ComponentType} props.Icon - The icon component to display inside the menu item.
 * @param {string} props.name - The name of the menu item, displayed as a tooltip on hover.
 * @param {string} props.route - The navigation route associated with the menu item.
 *
 * @returns {JSX.Element} A JSX element representing the collapsible menu item.
 *
 * @example
 * ```tsx
 * <CollapsedMenuItem
 *   Icon={SomeIcon}
 *   name="Dashboard"
 *   route="/dashboard"
 * />
 * ```
 */
const CollapsedMenuItem = ({ Icon, name, route }: MenuItemProps) => {
  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>
        <div className="items-cente mx-4 my-1.5 flex h-9 cursor-pointer">
          <NavLink
            to={route}
            className={({ isActive }) => {
              return isActive ? "active group" : "";
            }}
          >
            <li className="group flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg hover:bg-slate-100 group-[.active]:bg-slate-100">
              <Icon className="h-5 w-5 stroke-[1.5] text-[--icon-color] group-hover:text-primary group-[.active]:text-primary" />
            </li>
          </NavLink>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="absolute bottom-[0.5rem] left-[1.8rem] whitespace-nowrap rounded-lg border border-secondary bg-secondary px-3 py-1 text-sm font-normal capitalize text-white shadow-sm">
        {name}
      </HoverCardContent>
    </HoverCard>
  );
};

export { CollapsedMenuItem };
