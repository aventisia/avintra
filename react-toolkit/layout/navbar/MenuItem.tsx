import { cn } from "@aventisia/ui/lib";
import { NavLink } from "react-router-dom";

interface MenuItemProps {
  name: string;
  route: string;
  badge?: string;
  className?: string;
}

const MenuItem = ({ name, route, badge, className }: MenuItemProps) => {
  return (
    <NavLink
      to={route}
      className={({ isActive }) => {
        return isActive ? "active group rounded-lg" : "group rounded-lg";
      }}
    >
      <li
        className={cn(
          "mx-0.5 flex cursor-pointer items-center overflow-hidden rounded-lg px-3 pb-[0.2rem] pt-[0.3rem] text-sm",
          className,
        )}
      >
        <div className="flex flex-col items-center">
          <span className="block whitespace-nowrap font-medium capitalize group-[.active]:text-primary">
            {name}
          </span>
          <span className="block h-[0.1rem] w-[85%] rounded-full bg-transparent group-hover:bg-primary group-[.active]:bg-primary"></span>
        </div>
        {badge && (
          <span className="ml-1.5 block rounded-xl bg-slate-200 px-1.5 py-0.5 text-2xs">
            {badge}
          </span>
        )}
      </li>
    </NavLink>
  );
};

export { MenuItem };
