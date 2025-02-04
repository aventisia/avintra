import { useBaseLayoutStore } from "@/react-toolkit/stores/base-layout-store";
import { ISubMenuItem } from "@/react-toolkit/types/nav-data-types";
import { AccordionContent } from "@/react-toolkit/ui/accordion";
import { NavLink } from "react-router-dom";

interface SubMenuItemsProps {
  items: ISubMenuItem[];
}

const SubMenuItems = ({ items }: SubMenuItemsProps) => {
  const { navbarOnSheetOpen, setNavbarOnSheetOpen } = useBaseLayoutStore();

  function closeNavbarOnSheet() {
    if (navbarOnSheetOpen) {
      setNavbarOnSheetOpen(false);
    }
  }

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
