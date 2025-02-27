import { IconProps } from "@/react-toolkit/types/icon-props";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/react-toolkit/ui/hover-card";
import { NavLink } from "react-router-dom";

interface MenuItemProps {
  Icon: React.ComponentType<IconProps>;
  name: string;
  route: string;
}

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
            <li className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg hover:bg-slate-100 group-[.active]:bg-slate-100">
              <Icon className="h-5 w-5 stroke-[1.5] text-[--icon-color]" />
            </li>
          </NavLink>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="absolute bottom-[0.5rem] left-[1.8rem] whitespace-nowrap rounded-lg border border-slate-100 bg-white px-3 py-1 text-sm font-normal capitalize shadow-sm">
        {name}
      </HoverCardContent>
    </HoverCard>
  );
};

export { CollapsedMenuItem };
