import type { MyAccountSidebarLink } from "../types/my-account-sidebar-link";

export const MY_ACCOUNT_SIDEBAR_LINKS: MyAccountSidebarLink[] = [
  {
    linkLabel: "Profile Info",
    linkTo: "/account",
    linkIcon: "UserRound",
  },
  {
    linkLabel: "Email Settings",
    linkTo: "/account/email-settings",
    linkIcon: "MailCheck",
  },
  {
    linkLabel: "Security",
    linkTo: "/account/security",
    linkIcon: "KeyRound",
  },
  {
    linkLabel: "Device History",
    linkTo: "/account/device-history",
    linkIcon: "Smartphone",
  },
  {
    linkLabel: "Account Deactivation",
    linkTo: "/account/account-deactivation",
    linkIcon: "UserX",
  },
];
