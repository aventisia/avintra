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

  // Render the submenu items
  return (
    <AccordionContent className="ml-[2rem] flex flex-col p-0 py-1">
      {items.map((item, index) => (
        <NavLink
          key={index}
          to={item.route}
          className={({ isActive }) => {
            return isActive ? "active group" : "";
          }}
          onClick={closeNavbarOnSheet}
        >
          <li className="flex h-9 cursor-pointer items-center border-l-[3px] border-slate-100 pl-5 pr-3.5 text-sm capitalize hover:border-slate-400 group-[.active]:border-primary">
            {item.name}
          </li>
        </NavLink>
      ))}
    </AccordionContent>
  );
};

export { SubMenuItems };
