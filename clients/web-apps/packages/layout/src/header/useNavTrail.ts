import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { useLocation } from "react-router-dom";

import { findNavTrail } from "./find-nav-trail";

/** Section, menu item and sub item matching the current route, taken from the sidebar menu. */
const useNavTrail = () => {
  const sections = useBaseLayoutStore((state) => state.sidebarMenuSections);
  const { pathname } = useLocation();
  return findNavTrail(sections ?? [], pathname);
};

export { useNavTrail };
