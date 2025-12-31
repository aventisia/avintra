import * as lucideIcons from "lucide-react";

export type MyAccountSidebarLink = {
  linkLabel: string;
  linkTo: string;
  linkIcon?: keyof typeof lucideIcons.icons;
};
