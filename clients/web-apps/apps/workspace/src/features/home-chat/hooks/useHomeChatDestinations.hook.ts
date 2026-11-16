import { type ChatDestinationOption } from "@avplatform/chat";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { type SidebarMenuSectionType } from "@avplatform/ui/types";
import { useMemo } from "react";

/** Flattens sidebar sections, sub-pages included, into pages the chat may offer. */
export const toHomeChatDestinations = (
  sections: readonly SidebarMenuSectionType[],
): ChatDestinationOption[] =>
  sections.flatMap(({ sectionName, menuItems }) =>
    menuItems.flatMap(({ name, route, Icon, subMenuItems }) => [
      { route, label: name, section: sectionName, icon: Icon },
      // Sub-pages carry their parent's roles, so the parent's filter covers them.
      ...(subMenuItems ?? []).map((sub) => ({
        route: sub.route,
        label: `${name} › ${sub.name}`,
        section: sectionName,
        icon: Icon,
      })),
    ]),
  );

/** The pages the user's sidebar offers, already filtered by role and deployment. */
export const useHomeChatDestinations = () => {
  const sections = useBaseLayoutStore((state) => state.sidebarMenuSections);
  return useMemo(() => toHomeChatDestinations(sections ?? []), [sections]);
};
