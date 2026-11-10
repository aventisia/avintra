import type { SidebarMenuSectionType } from "@avplatform/ui/types";

interface NavCrumb {
  name: string;
  route?: string;
}

const matchesRoute = (pathname: string, route: string) =>
  pathname === route || pathname.startsWith(`${route}/`);

const findNavTrail = (sections: SidebarMenuSectionType[], pathname: string): NavCrumb[] => {
  let trail: NavCrumb[] = [];
  let matchedLength = 0;
  const consider = (crumbs: NavCrumb[], route: string) => {
    if (matchesRoute(pathname, route) && route.length > matchedLength) {
      trail = crumbs;
      matchedLength = route.length;
    }
  };

  for (const section of sections) {
    const sectionCrumb = { name: section.sectionName };
    for (const item of section.menuItems) {
      const itemCrumb = { name: item.name, route: item.route };
      consider([sectionCrumb, itemCrumb], item.route);
      for (const sub of item.subMenuItems ?? []) {
        consider([sectionCrumb, itemCrumb, { name: sub.name, route: sub.route }], sub.route);
      }
    }
  }
  return trail;
};

export { findNavTrail, type NavCrumb };
