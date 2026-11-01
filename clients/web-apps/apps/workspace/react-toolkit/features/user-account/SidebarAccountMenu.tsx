import { ThemeSwitcher } from "@avplatform/layout";
import { Separator } from "@avplatform/ui";
import Lucide from "@avplatform/ui/components/Lucide";
import { IS_TAURI } from "@avplatform/ui/constants";
import { cn } from "@avplatform/ui/lib";
import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";
import { toast } from "@avplatform/ui/sonner";
import { useBaseLayoutStore, useUserSessionStore } from "@avplatform/ui/stores";
import { getUserDisplayName } from "@avplatform/ui/utils";
import { useMutation } from "@tanstack/react-query";
import { BellIcon, ChevronsUpDownIcon, DownloadIcon, Loader2, LogOutIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { PersonAvatar } from "@/components/PersonAvatar";
import { adminHubs } from "@/components/layout/sidebar-hubs.constant";
import { getHubRoutes } from "@/components/layout/sidebar-hubs.util";
import { useDownloadDialogStore } from "@/features/desktop-download/stores/download-dialog-store";
import { useAccountDialogUrlState } from "@/features/my-account";
import { logOffFromCurrentSession } from "@/react-toolkit/apis/accounts-me-apis";
import { useUnreadNotificationsStore } from "@/react-toolkit/features/unread-notifications/stores/unread-notifications-store";

import { AccountMenuAction } from "./AccountMenuAction";
import { RoleSelector } from "./RoleSelector";

interface SidebarAccountMenuProps {
  /** Additional class name to override popover content container style */
  className?: string;
}

/**
 * Account row at the bottom of the sidebar (and the mobile sidebar drawer); opens the account
 * menu, which also leads to notifications, the desktop download and the admin consoles.
 */
const SidebarAccountMenu = ({ className }: SidebarAccountMenuProps) => {
  // Get user session state and actions
  const { userSession, setUserSession } = useUserSessionStore();

  //state to close the popover
  const { isPopOverOpen, setisPopOverOpen, sidebarExpand, sections, setSidebarOnDialogOpen } =
    useBaseLayoutStore(
      useShallow((state) => ({
        isPopOverOpen: state.isPopOverOpen,
        setisPopOverOpen: state.setIsPopOverOpen,
        sidebarExpand: state.sidebarExpand,
        sections: state.sidebarMenuSections ?? [],
        setSidebarOnDialogOpen: state.setSidebarOnDialogOpen,
      })),
    );

  const { unreadCount, toggleNotifications } = useUnreadNotificationsStore(
    useShallow((state) => ({
      unreadCount: state.unreadCount,
      toggleNotifications: state.toggleOpen,
    })),
  );
  const toggleDownloadDialog = useDownloadDialogStore((state) => state.toggleOpen);
  const { openAccountDialog } = useAccountDialogUrlState();

  const fullName = userSession ? getUserDisplayName(userSession) : "User Name";
  const adminConsoles = adminHubs
    .map((hub) => ({ hub, routes: getHubRoutes(sections, hub.id) }))
    .filter(({ routes }) => routes.length > 0);

  // Get navigate function
  const navigate = useNavigate();

  const runAndCloseMenus = (action: () => void) => () => {
    action();
    setisPopOverOpen(false);
    setSidebarOnDialogOpen(false);
  };

  // Define mutation to log off from current session
  const { mutate, isPending } = useMutation({
    mutationFn: logOffFromCurrentSession,
    onSuccess: (httpResponse) => {
      if (httpResponse.data) {
        setUserSession(null);
        // TODO: Temporarily added for switch tenant feat
        localStorage.removeItem("tenant_switch");
        const accountsBase = import.meta.env.VITE_ACCOUNTS_PATH;
        navigate("/redirect?msg=Logging out...&url=" + accountsBase);
      } else toast.error(httpResponse.message);
    },
    onError: (error) => {
      toast.error(error.toString());
    },
  });

  return (
    <Popover open={isPopOverOpen} onOpenChange={setisPopOverOpen}>
      <PopoverTrigger
        aria-label="Account menu"
        data-account-menu-trigger=""
        className={cn(
          "flex h-11 w-full items-center gap-2.5 rounded-md px-2 text-left outline-none transition-colors duration-[120ms] ease-out hover:bg-hover focus-visible:shadow-focus data-[state=open]:bg-hover",
          !sidebarExpand && "justify-center px-0",
        )}
      >
        <span className="relative shrink-0">
          <PersonAvatar name={fullName} className="size-7 text-[11px]" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-destructive ring-2 ring-bg" />
          )}
        </span>
        {sidebarExpand && (
          <>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-body-sm font-medium text-ink">{fullName}</span>
              <span className="truncate text-xs text-muted-foreground">
                {userSession?.tenantName}
              </span>
            </span>
            <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
          </>
        )}
      </PopoverTrigger>
      <PopoverContent
        side={sidebarExpand ? "top" : "right"}
        align="start"
        className={cn("flex w-[15rem] flex-col p-1", className)}
      >
        {/* Header */}
        <div className={cn("flex flex-col justify-center gap-1 px-3.5 pb-2 pt-2.5")}>
          <span className="truncate whitespace-nowrap text-base font-medium uppercase leading-4">
            {fullName}
          </span>
          <span className="truncate whitespace-nowrap text-2xs font-normal lowercase">
            {userSession ? userSession?.email : "useremail@domain.com"}
          </span>
          {userSession?.tenantName === userSession?.email ? null : (
            <span
              title={userSession ? userSession?.tenantName : "Tenant Name"}
              className="truncate whitespace-nowrap text-2xs font-medium"
            >
              {userSession ? userSession?.tenantName : "Tenant Name"}
            </span>
          )}
        </div>
        <Separator className="my-1 h-[0.5px]" />
        <AccountMenuAction onClick={runAndCloseMenus(openAccountDialog)}>
          <Lucide icon="User" className="h-4 w-4" />
          My account
        </AccountMenuAction>
        <AccountMenuAction onClick={runAndCloseMenus(() => toggleNotifications(true))}>
          <BellIcon className="h-4 w-4" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-auto rounded-full bg-destructive px-1.5 font-mono text-2xs leading-4 text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </AccountMenuAction>
        {!IS_TAURI && (
          <AccountMenuAction onClick={runAndCloseMenus(() => toggleDownloadDialog(true))}>
            <DownloadIcon className="h-4 w-4" />
            Download desktop app
          </AccountMenuAction>
        )}
        {adminConsoles.map(({ hub, routes }) => (
          <AccountMenuAction key={hub.id} onClick={runAndCloseMenus(() => navigate(routes[0]))}>
            <hub.Icon className="h-4 w-4" />
            {hub.name}
          </AccountMenuAction>
        ))}
        <Separator className="my-1 h-[0.5px]" />
        <ThemeSwitcher className="h-9" />
        <Separator className="my-1 h-[0.5px]" />
        {/* Role selector for filtering the sidebar menu */}
        <RoleSelector />
        <Separator className="my-1 h-[0.5px]" />
        {/* Logout */}
        <AccountMenuAction onClick={() => mutate()}>
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin text-[--icon-color]" />
          ) : (
            <LogOutIcon className="h-4 w-4" />
          )}
          Logout
        </AccountMenuAction>
      </PopoverContent>
    </Popover>
  );
};

export { SidebarAccountMenu };
