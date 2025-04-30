import { useBaseLayoutStore } from "@/react-toolkit/stores/base-layout-store";
import { IconProps } from "@/react-toolkit/types/icon-props";
import { ISubMenuItem } from "@/react-toolkit/types/nav-data-types";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/react-toolkit/ui/hover-card";

import { useState } from "react";

interface CollapsedMultiLevelMenuButtonProps {
  Icon: React.ComponentType<IconProps>;
  name: string;
  subMenuItems: ISubMenuItem[];
}

const CollapsedMultiLevelMenuButton = ({
  Icon,
  name,
  subMenuItems,
}: CollapsedMultiLevelMenuButtonProps) => {
  const [isSubMenuOpened, setIsSubMenuOpened] = useState<boolean>(false);
  const { sidebarExpand } = useBaseLayoutStore();

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
        <div
          className={`mx-4 flex h-9 w-9 items-center rounded-lg group-hover:bg-slate-100 ${
            isSubMenuOpened ? "bg-slate-100" : ""
          }`}
        >
          <div className="flex h-8 w-12 items-center justify-center">
            <Icon className="h-5 w-5 stroke-[1.5] text-[--icon-color]" />
          </div>
          <span
            className={`whitespace-nowrap capitalize ${
              sidebarExpand ? "block" : "hidden"
            }`}
          >
            {name}
          </span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="absolute -top-[2.45rem] left-[2.15rem] rounded-r-lg border bg-white shadow-sm">
        <div className="rounded-rt-lg h-9 border-b border-slate-100 px-3 py-1.5">
          <span className="whitespace-nowrap rounded-r-lg px-3 text-sm font-medium capitalize">
            {name}
          </span>
        </div>
        <ul className="ml-3 py-1">
          {subMenuItems.map((subMenuItem, index) => (
            <li
              key={index}
              className="flex h-9 cursor-pointer items-center whitespace-nowrap border-l-[3px] border-slate-100 pl-3 pr-3.5 text-sm font-normal capitalize hover:border-slate-400"
            >
              {subMenuItem.name}
            </li>
          ))}
        </ul>
      </HoverCardContent>
    </HoverCard>
  );
};

export { CollapsedMultiLevelMenuButton };
