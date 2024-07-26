import { IAppConfig } from "@/react-toolkit/types/app-config";
import { NavLocation } from "@/react-toolkit/types/nav-data-types";
import {
  ArchiveBoxIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  FolderIcon,
  HomeIcon,
  IdentificationIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon,
  UserGroupIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

const workspaceAppConfig: IAppConfig = {
  showUpgradeCard: false,
  showChatAssistant: true,
  searchBoxOptions: {
    show: true,
    position: "center",
  },
  navData: {
    navLocation: NavLocation.sidebar,
    sideNavMenuSections: [
      {
        sectionName: "main menu",
        menuItems: [
          {
            Icon: HomeIcon,
            name: "home",
            route: "/home",
          },
          {
            Icon: FolderIcon,
            name: "projects",
            route: "/projects",
          },
          {
            Icon: ArchiveBoxIcon,
            name: "marketplace",
            route: "/marketplace",
          },
          {
            Icon: UserCircleIcon,
            name: "account",
            route: "/account",
          },
        ],
      },
      {
        sectionName: "admin options",
        menuItems: [
          {
            Icon: IdentificationIcon,
            name: "tenants",
            route: "/tenants",
          },
          {
            Icon: UsersIcon,
            name: "users",
            route: "/users",
          },
          {
            Icon: UserGroupIcon,
            name: "groups",
            route: "/groups",
          },
          {
            Icon: CreditCardIcon,
            name: "billing",
            route: "/billing",
          },
          {
            Icon: Cog6ToothIcon,
            name: "settings",
            route: "/settings",
          },
          {
            Icon: QuestionMarkCircleIcon,
            name: "support",
            route: "/support",
          },
        ],
      },
    ],
  },
};

export { workspaceAppConfig };
