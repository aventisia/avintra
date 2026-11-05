import { ThemeSwitcher } from "@avplatform/layout";
import { IS_TAURI } from "@avplatform/ui/constants";
import { cn } from "@avplatform/ui/lib";
import { Popover, PopoverContent, PopoverTrigger } from "@avplatform/ui/popover";
import { toast } from "@avplatform/ui/sonner";
import { useBaseLayoutStore, useUserSessionStore } from "@avplatform/ui/stores";
import {
  BellIcon,
  BuildingsIcon,
  CaretUpDownIcon,
  CircleNotchIcon,
  DownloadSimpleIcon,
  SignOutIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { PersonAvatar } from "@/components/PersonAvatar";
import { adminHubs } from "@/components/layout/sidebar-hubs.constant";
import { getHubRoutes } from "@/components/layout/sidebar-hubs.util";
import { ROLE_SA } from "@/constants/roles";
import { DESKTOP_DOWNLOAD_ROUTE } from "@/features/desktop-download";
import { useAccountDialogUrlState } from "@/features/my-account";
import { logOffFromCurrentSession } from "@/react-toolkit/apis/accounts-me-apis";
import { NOTIFICATIONS_ROUTE } from "@/react-toolkit/features/unread-notifications/constants/constants";
import { useUnreadNotificationsStore } from "@/react-toolkit/features/unread-notifications/stores/unread-notifications-store";

import { AccountMenuAction } from "./AccountMenuAction";
import { RoleSelector } from "./RoleSelector";

const MenuSeparator = () => <div role="separator" className="-mx-1 my-1 h-px bg-line" />;

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

  const unreadCount = useUnreadNotificationsStore((state) => state.unreadCount);
  const { openAccountDialog } = useAccountDialogUrlState();

  const fullName =
    [userSession?.firstName, userSession?.lastName].filter(Boolean).join(" ") ||
    userSession?.email ||
    "";
  const isSuperAdmin = userSession?.userRoles.includes(ROLE_SA) ?? false;
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
            <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-bad ring-2 ring-bg" />
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
            <CaretUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
          </>
        )}
      </PopoverTrigger>
      <PopoverContent
        side={sidebarExpand ? "top" : "right"}
        align="start"
        className={cn("flex w-64 flex-col p-1", className)}
      >
        <div className="flex items-center gap-2.5 px-2 pb-2.5 pt-2">
          <PersonAvatar name={fullName} className="size-9 text-xs" />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-body-sm font-medium text-ink">{fullName}</span>
            <span title={userSession?.email} className="truncate text-xs text-muted-foreground">
              {userSession?.email}
            </span>
          </div>
        </div>
        {userSession?.tenantName && userSession.tenantName !== userSession.email && (
          <div
            title={userSession.tenantName}
            className="mx-1 mb-1 flex items-center gap-2 rounded-sm bg-sunken px-2 py-1.5 text-xs text-ink-2"
          >
            <BuildingsIcon className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{userSession.tenantName}</span>
          </div>
        )}
        <MenuSeparator />
        <AccountMenuAction onClick={runAndCloseMenus(openAccountDialog)}>
          <UserIcon />
          My account
        </AccountMenuAction>
        <AccountMenuAction onClick={runAndCloseMenus(() => navigate(NOTIFICATIONS_ROUTE))}>
          <BellIcon />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-auto rounded-full bg-bad px-1.5 font-mono text-2xs leading-4 text-bad-foreground">
              {unreadCount}
            </span>
          )}
        </AccountMenuAction>
        {!IS_TAURI && (
          <AccountMenuAction onClick={runAndCloseMenus(() => navigate(DESKTOP_DOWNLOAD_ROUTE))}>
            <DownloadSimpleIcon />
            Download desktop app
          </AccountMenuAction>
        )}
        {(adminConsoles.length > 0 || isSuperAdmin) && (
          <>
            <MenuSeparator />
            <span className="px-2 pb-1 pt-2 text-label uppercase text-muted-foreground">
              Administration
            </span>
            {adminConsoles.map(({ hub, routes }) => (
              <AccountMenuAction key={hub.id} onClick={runAndCloseMenus(() => navigate(routes[0]))}>
                <hub.Icon />
                {hub.name}
              </AccountMenuAction>
            ))}
            {isSuperAdmin && <RoleSelector />}
          </>
        )}
        <MenuSeparator />
        <ThemeSwitcher className="h-9 px-2" />
        <MenuSeparator />
        <AccountMenuAction onClick={() => mutate()} disabled={isPending}>
          {isPending ? <CircleNotchIcon className="animate-spin" /> : <SignOutIcon />}
          {isPending ? "Logging out" : "Log out"}
        </AccountMenuAction>
      </PopoverContent>
    </Popover>
  );
};

export { SidebarAccountMenu };
