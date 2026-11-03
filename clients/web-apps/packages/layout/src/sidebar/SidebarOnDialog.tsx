import { Button } from "@avplatform/ui/buttons";
import { Dialog, DialogContent, DialogTrigger } from "@avplatform/ui/dialog";
import { cn } from "@avplatform/ui/lib";
import { ScrollArea } from "@avplatform/ui/scroll";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { ListIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { UpgradeCard } from "./UpgradeCard";
import { SidebarMenuItems } from "./menu-items";

interface SidebarOnDialogProps {
  appLogo: React.ReactNode;
  /** Rendered below the menu, such as the app's account menu. */
  footer?: React.ReactNode;
  className?: string;
}

/**
 * SidebarOnDialog component renders a sidebar within a dialog in mobile view.
 * It provides a responsive UI element that can be toggled open or closed
 * and includes navigation items and an upgrade card.
 *
 * @param {SidebarOnDialogProps} props - The properties for the SidebarOnDialog component.
 * @param {React.ReactNode} props.appLogo - The application logo to display at the top of the sidebar.
 * @param {React.ReactNode} [props.footer] - Content rendered below the menu, such as the account menu.
 * @param {string} [props.className] - Additional class names to style the component.
 *
 * @returns {JSX.Element} The SidebarOnDialog component.
 *
 * @remarks
 * - Uses the `useBaseLayoutStore` hook to manage the sidebar's state.
 * - Includes a button to trigger the sidebar dialog and expand the sidebar.
 * - Contains the application logo, navigation menu items, and an upgrade card.
 *
 * @example
 * ```tsx
 * <SidebarOnDialog className="custom-class" />
 * ```
 */
const SidebarOnDialog = ({ appLogo, footer, className }: SidebarOnDialogProps) => {
  // Get state and actions from the base layout store
  const { sidebarOnDialogOpen, setSidebarOnDialogOpen, setSidebarExpand } = useBaseLayoutStore(
    useShallow((state) => ({
      sidebarOnDialogOpen: state.sidebarOnDialogOpen,
      setSidebarOnDialogOpen: state.setSidebarOnDialogOpen,
      setSidebarExpand: state.setSidebarExpand,
    })),
  );

  // Return the sidebar dialog component
  return (
    <Dialog
      open={sidebarOnDialogOpen}
      onOpenChange={() => setSidebarOnDialogOpen(!sidebarOnDialogOpen)}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon8"
          className={cn(
            "mr-2 flex size-control-md rounded-md border-none bg-transparent text-ink-2 shadow-none hover:bg-hover hover:text-ink md:hidden",
            className,
          )}
          onClick={() => setSidebarExpand(true)}
        >
          <ListIcon className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent side="left" className="w-[--sidebar-max-width] bg-bg">
        <ScrollArea className="my-2 h-[calc(100vh-1.1rem)]">
          <div className="flex h-[--header-height] items-center px-4">{appLogo}</div>
          <nav className="h-auto">
            <SidebarMenuItems />
            <UpgradeCard />
          </nav>
          {footer}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export { SidebarOnDialog };
