import { MenuItem } from "@/react-toolkit/layout/navbar/MenuItem";
import { MultiLevelMenuItem } from "@/react-toolkit/layout/navbar/MultiLevelMenuItem";
import { cn } from "@/react-toolkit/lib/utils";
import { ITopNavMenuItem } from "@/react-toolkit/types/nav-data-types";

interface MenuItemsProps {
  topNavMenuItems?: ITopNavMenuItem[];
  className?: string;
}

const MenuItems = ({ topNavMenuItems, className }: MenuItemsProps) => {
  return (
    <div className={cn("ml-7 flex items-center", className)}>
      {topNavMenuItems?.map((menuItem, index) => (
        <div key={index}>
          {menuItem.subMenuItems ? (
            <MultiLevelMenuItem
              name={menuItem.name}
              subMenuItems={menuItem.subMenuItems}
            />
          ) : (
            <MenuItem name={menuItem.name} route={menuItem.route} />
          )}
        </div>
      ))}
    </div>
  );
};

export { MenuItems };
