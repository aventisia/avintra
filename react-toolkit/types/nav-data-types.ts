enum NavLocation {
  header,
  sidebar,
}

interface INavDataType {
  navLocation: NavLocation;
  sideNavMenuSections: ISideNavMenuSection[];
}

interface ISideNavMenuSection {
  sectionName: string;
  menuItems: IMenuItem[];
  showSection?: boolean; // TODO: Remove this once we have a way to handle this using user roles
}

interface IMenuItem {
  Icon: React.ComponentType;
  name: string;
  route: string;
  badge?: string;
  subMenuItems?: ISubMenuItem[];
}

interface ITopNavMenuItem {
  name: string;
  route: string;
  subMenuItems?: ISubMenuItem[];
}

interface ISubMenuItem {
  name: string;
  route: string;
}

export {
  NavLocation,
  type INavDataType,
  type ISideNavMenuSection,
  type IMenuItem,
  type ITopNavMenuItem,
  type ISubMenuItem,
};
