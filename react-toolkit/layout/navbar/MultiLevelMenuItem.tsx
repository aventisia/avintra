import { MenuItem } from "@/react-toolkit/layout/navbar/MenuItem";
import { ISubMenuItem } from "@/react-toolkit/types/nav-data-types";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@aventisia/ui/hover-card";
import { useState } from "react";

interface MultiLevelMenuItemProps {
  name: string;
  subMenuItems: ISubMenuItem[];
}

const MultiLevelMenuItem = ({
  name,
  subMenuItems,
}: MultiLevelMenuItemProps) => {
  const [isSubMenuOpened, setIsSubMenuOpened] = useState<boolean>(false);

  const subMenuOpenChanged = () => {
    setIsSubMenuOpened((state) => !state);
  };

  const handleHoverCardTriggerClick = () => {
    setIsSubMenuOpened(true);
  };

  return (
    <HoverCard
      open={isSubMenuOpened}
      onOpenChange={subMenuOpenChanged}
      openDelay={0}
      closeDelay={0}
    >
      <HoverCardTrigger
        onClick={handleHoverCardTriggerClick}
        className="group flex h-9 cursor-pointer items-center"
      >
        <li className="mx-0.5 flex cursor-pointer items-center overflow-hidden rounded-lg px-3 pb-[0.2rem] pt-[0.3rem] text-sm">
          <div className="flex flex-col items-center">
            <span className="block whitespace-nowrap font-medium capitalize group-[.active]:text-primary">
              {name}
            </span>
            <span className="block h-[0.1rem] w-[85%] rounded-full bg-transparent group-hover:bg-primary group-[.active]:bg-primary"></span>
          </div>
        </li>
      </HoverCardTrigger>
      <HoverCardContent
        align="center"
        className="-mt-1 rounded-lg border bg-white shadow-sm"
      >
        <ul className="p-2">
          {subMenuItems.map((subMenuItem, index) => (
            <MenuItem
              className="my-1"
              key={index}
              name={subMenuItem.name}
              route={subMenuItem.route}
            />
          ))}
        </ul>
      </HoverCardContent>
    </HoverCard>
  );
};

export { MultiLevelMenuItem };
