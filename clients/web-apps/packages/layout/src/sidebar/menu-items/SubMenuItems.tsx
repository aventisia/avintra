import { AccordionContent } from "@avplatform/ui/accordion";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import type { SidebarSubMenuItemType } from "@avplatform/ui/types";
import { NavLink } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

interface SubMenuItemsProps {
  items: SidebarSubMenuItemType[];
}

/**
 * A React functional component that renders a list of submenu items within an accordion content.
 * Each submenu item is a navigational link that triggers a state update to close the sidebar
 * when clicked, if the sidebar is open.
 *
 * @component
 * @param {SubMenuItemsProps} props - The props object containing the submenu items.
 * @param {Array<{ route: string; name: string }>} props.items - An array of submenu items,
 * each containing a `route` for navigation and a `name` for display.
 *
 * @returns {JSX.Element} The rendered submenu items wrapped in an accordion content.
 *
 * @remarks
 * - Uses the `useBaseLayoutStore` hook to manage the sidebar state.
 * - Applies conditional styling to indicate active navigation links.
 * - Closes the sidebar when a submenu item is clicked, if the sidebar is open.
 *
 * @example
 * ```tsx
 * const items = [
 *   { route: '/dashboard', name: 'Dashboard' },
 *   { route: '/settings', name: 'Settings' },
 * ];
 *
 * <SubMenuItems items={items} />
 * ```
 */
const SubMenuItems = ({ items }: SubMenuItemsProps) => {
  // Get the state of the sidebar from the store
  const { sidebarOnDialogOpen, setSidebarOnDialogOpen } = useBaseLayoutStore(
    useShallow((state) => ({
      sidebarOnDialogOpen: state.sidebarOnDialogOpen,
      setSidebarOnDialogOpen: state.setSidebarOnDialogOpen,
    })),
  );

  // Function to close the sidebar when a sheet is opened
  function closeNavbarOnSheet() {
    if (sidebarOnDialogOpen) {
      setSidebarOnDialogOpen(false);
    }
  }

  return (
    <AccordionContent className="p-0">
      <div className="my-0.5 ml-4 grid gap-0.5 border-l border-line pl-[9px]">
        {items.map((item, index) => (
          <NavLink
            key={index}
            to={item.route}
            onClick={closeNavbarOnSheet}
            className="group relative flex h-[26px] items-center rounded-sm px-2 text-body-sm text-ink-2 transition-colors duration-[120ms] ease-out hover:bg-hover hover:text-ink focus-visible:shadow-focus focus-visible:outline-none aria-[current=page]:bg-selected aria-[current=page]:font-semibold aria-[current=page]:text-ink motion-reduce:transition-none"
          >
            <span className="absolute -left-2.5 bottom-1.5 top-1.5 hidden w-0.5 rounded-r-sm bg-indicator group-aria-[current=page]:block" />
            <span className="truncate">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </AccordionContent>
  );
};

export { SubMenuItems };
