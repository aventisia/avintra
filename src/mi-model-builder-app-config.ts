import { IAppConfig } from "@/react-toolkit/types/app-config";
import { NavLocation } from "@/react-toolkit/types/nav-data-types";
import {
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  Squares2X2Icon,
  // Square3Stack3DIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

const mlModelBuilderAppConfig: IAppConfig = {
  showUpgradeCard: false,
  showChatAssistant: false,
  searchBoxOptions: {
    show: false,
    position: "center",
  },
  navData: {
    navLocation: NavLocation.sidebar,
    sideNavMenuSections: [
      {
        showSection: true, // TODO: Remove this once we have a way to handle this using user roles
        sectionName: "Main menu",
        menuItems: [
          {
            Icon: Squares2X2Icon,
            name: "Model library",
            route: "/model-library",
          },
        ],
      },
      {
        showSection: true, // TODO: Remove this once we have a way to handle this using user roles
        sectionName: "Extraction ",
        menuItems: [
          {
            Icon: DocumentTextIcon,
            name: "Label data",
            route: "/label-data",
          },
          // {
          //   Icon: Square3Stack3DIcon,
          //   name: "Model",
          //   route: "/model",
          // },
          {
            Icon: ClipboardDocumentCheckIcon,
            name: "Test",
            route: "/test",
          },
        ],
      },
      {
        showSection: false, // TODO: Remove this once we have a way to handle this using user roles
        sectionName: "Help",
        menuItems: [
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

export { mlModelBuilderAppConfig };
