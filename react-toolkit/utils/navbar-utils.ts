import { INavDataType, ITopNavMenuItem } from "@/react-toolkit/types/nav-data-types";

/**
 * It converts navigation links/routes to a format which work with
 * top navbar. By default nav data' structure is made for sidebar
 * navigation because in mobile view navbar has to be shown on the
 * sidebar so it requires conversion if user selects to keep navigation
 * on the top navbar
 * @param {INavDataType} navData navigation names, icons and links data
 * @returns {ITopNavMenuItem[]} array of menuItems in top navbar type
 */
const convertNavDataForTopNavbar = (
  navData: INavDataType,
): ITopNavMenuItem[] => {
  const topNavMenuItems: ITopNavMenuItem[] = [];

  navData.sideNavMenuSections.forEach((menuSection, index) => {
    if (index === 0) {
      // Push MAIN MENU (first section)
      menuSection.menuItems.forEach((item) => {
        topNavMenuItems.push({
          name: item.name,
          route: item.route,
          subMenuItems: item.subMenuItems,
        });
      });
    } else {
      // Push rest sections as menu Items
      topNavMenuItems.push({
        name: menuSection.sectionName,
        route: "",
        subMenuItems: menuSection.menuItems.map((menuItem) => ({
          name: menuItem.name,
          route: menuItem.route,
        })),
      });
    }
  });

  return topNavMenuItems;
};

export { convertNavDataForTopNavbar };
