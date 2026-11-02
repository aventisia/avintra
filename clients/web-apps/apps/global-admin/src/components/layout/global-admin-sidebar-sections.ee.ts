import type { SidebarMenuSectionType } from "@avplatform/ui/types";
import { IdentificationIcon } from "@heroicons/react/24/outline";

/** Global Admin shows a single entry: the on-prem tenant list. */
export const globalAdminSidebarSections: SidebarMenuSectionType[] = [
  {
    sectionName: "Global Admin",
    menuItems: [
      {
        Icon: IdentificationIcon,
        name: "On-prem Tenants",
        route: "/on-prem-tenants",
      },
    ],
  },
];
