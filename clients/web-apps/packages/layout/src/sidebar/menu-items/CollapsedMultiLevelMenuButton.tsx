import { HoverCard, HoverCardContent, HoverCardTrigger } from "@avplatform/ui/hover-card";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import type { IconProps, SidebarSubMenuItemType } from "@avplatform/ui/types";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

interface CollapsedMultiLevelMenuButtonProps {
  Icon: React.ComponentType<IconProps>;
  name: string;
  subMenuItems: SidebarSubMenuItemType[];
}

/**
 * A React component that renders a button with an icon and a name, which can expand to show a submenu
 * when hovered or clicked. This component is designed to work within a collapsible sidebar layout.
 *
 * @component
 * @param {CollapsedMultiLevelMenuButtonProps} props - The props for the component.
 * @param {React.ElementType} props.Icon - The icon component to display in the button.
 * @param {string} props.name - The name of the menu item to display.
 * @param {Array<{ name: string }>} props.subMenuItems - An array of submenu items, each with a `name` property.
 *
 * @returns {JSX.Element} The rendered CollapsedMultiLevelMenuButton component.
 *
 * @remarks
 * - The component uses a hover card to display the submenu items when the button is hovered or clicked.
 * - The `sidebarExpand` state from the base layout store determines whether the name of the menu item is visible.
 * - The submenu items are displayed in a list with hover effects and a border to indicate selection.
 *
 * @example
 * ```tsx
 * <CollapsedMultiLevelMenuButton
 *   Icon={SomeIcon}
 *   name="Menu Item"
 *   subMenuItems={[{ name: "Submenu 1" }, { name: "Submenu 2" }]}
 * />
 * ```
 */
const CollapsedMultiLevelMenuButton = ({
  Icon,
  name,
  subMenuItems,
}: CollapsedMultiLevelMenuButtonProps) => {
  // State to manage the open/close status of the submenu
  const [isSubMenuOpened, setIsSubMenuOpened] = useState<boolean>(false);

  // Get the sidebarExpand state from the base layout store
  const { sidebarExpand } = useBaseLayoutStore(
    useShallow((state) => ({
      sidebarExpand: state.sidebarExpand,
    })),
  );

  // Function to toggle the submenu open/close status
  const subMenuOpenChanged = () => {
    setIsSubMenuOpened((state) => !state);
  };

  // Function to handle click event on the hover card trigger
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
          <span className={`whitespace-nowrap capitalize ${sidebarExpand ? "block" : "hidden"}`}>
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
