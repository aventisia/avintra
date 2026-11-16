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
        className="group mx-auto my-0.5 flex size-9 cursor-pointer items-center justify-center"
      >
        <div
          className={`flex size-9 items-center justify-center rounded-sm text-muted-foreground transition-colors duration-[120ms] ease-out group-hover:bg-hover group-hover:text-ink motion-reduce:transition-none ${
            isSubMenuOpened ? "bg-hover text-ink" : ""
          }`}
        >
          <Icon className="size-4 stroke-[1.75]" />
          <span className={`whitespace-nowrap ${sidebarExpand ? "block" : "hidden"}`}>{name}</span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="absolute -top-[2.45rem] left-[2.15rem] w-auto rounded-md border border-line bg-surface p-1 text-ink shadow-pop">
        <div className="px-2 pb-1.5 pt-1 text-label uppercase text-muted-foreground">{name}</div>
        <ul className="grid gap-0.5">
          {subMenuItems.map((subMenuItem, index) => (
            <li
              key={index}
              className="flex h-control-sm cursor-pointer items-center whitespace-nowrap rounded-sm px-2 text-body-sm text-ink-2 hover:bg-hover hover:text-ink"
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
