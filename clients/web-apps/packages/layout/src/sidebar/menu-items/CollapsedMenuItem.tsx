import { Tooltip } from "@avplatform/ui/tooltip";
import type { IconProps } from "@avplatform/ui/types";
import { NavLink } from "react-router-dom";

interface MenuItemProps {
  Icon: React.ComponentType<IconProps>;
  name: string;
  route: string;
}

/**
 * A functional component that renders a collapsible menu item with an icon and a right-side tooltip naming it.
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
    <Tooltip content={name} side="right">
      <NavLink
        to={route}
        aria-label={name}
        className="group relative mx-auto my-0.5 flex size-9 items-center justify-center rounded-sm text-muted-foreground transition-colors duration-[120ms] ease-out hover:bg-hover hover:text-ink focus-visible:shadow-focus focus-visible:outline-none aria-[current=page]:bg-selected aria-[current=page]:text-primary-text motion-reduce:transition-none"
      >
        <span className="absolute -left-2.5 bottom-1.5 top-1.5 hidden w-0.5 rounded-r-sm bg-indicator group-aria-[current=page]:block" />
        <Icon className="size-4 stroke-[1.75]" />
      </NavLink>
    </Tooltip>
  );
};

export { CollapsedMenuItem };
