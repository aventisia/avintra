import { MenuItems } from "@/react-toolkit/layout/navbar/MenuItems";
import { cn } from "@aventisia/ui/lib";
import {
  INavDataType,
  ITopNavMenuItem,
} from "@/react-toolkit/types/nav-data-types";
import { convertNavDataForTopNavbar } from "@/react-toolkit/utils/navbar-utils";

interface NavbarProps {
  navData: INavDataType;
  className?: string;
}

const Navbar = ({ navData, className }: NavbarProps) => {
  const menuItems: ITopNavMenuItem[] = convertNavDataForTopNavbar(navData);

  return (
    <nav className={cn("hidden items-center md:flex", className)}>
      {navData && <MenuItems topNavMenuItems={menuItems} />}
    </nav>
  );
};

export { Navbar };

