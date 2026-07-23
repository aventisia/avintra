import Lucide from "@avplatform/ui/components/Lucide";
import clsx from "clsx";
import { Link, matchPath, useLocation } from "react-router-dom";

import type { MyAccountSidebarLink as MyAccountSidebarLinkProps } from "../types/my-account-sidebar-link";

export const MyAccountSidebarLink = ({
  linkLabel,
  linkTo = "#",
  linkIcon = "Image",
}: MyAccountSidebarLinkProps) => {
  const { pathname } = useLocation();

  return (
    <Link
      to={linkTo}
      className={clsx([
        "flex items-center py-3 text-sm first:-mt-3 last:-mb-3 hover:text-primary [&.active]:font-medium [&.active]:text-primary",
        {
          active: matchPath(linkTo, pathname),
        },
      ])}
    >
      <Lucide icon={linkIcon} className="mr-3 h-4 w-4 stroke-[2]" />
      {linkLabel}
    </Link>
  );
};
