import { Accordion, AccordionItem } from "@avplatform/ui/accordion";
import { useBaseLayoutStore } from "@avplatform/ui/stores";
import { useShallow } from "zustand/react/shallow";

import { CollapsedMenuItem } from "./CollapsedMenuItem";
import { CollapsedMultiLevelMenuButton } from "./CollapsedMultiLevelMenuButton";
import { MultiLevelMenuButton } from "./MultiLevelMenuButton";
import { SectionHeader } from "./SectionHeader";
import { SidebarMenuItem } from "./SidebarMenuItem";
import { SubMenuItems } from "./SubMenuItems";

/**
 * SidebarMenuItems component renders the menu items for the sidebar layout.
 * It dynamically generates sections and menu items based on the state from the store.
 * The component also handles user role-based visibility for sections.
 *
 * @component
 *
 * @returns {JSX.Element} A React component that displays the sidebar menu items.
 *
 * @remarks
 * - The component uses `useBaseLayoutStore` to fetch the sidebar state, including
 *   whether the sidebar is expanded and the menu sections to display.
 * - It uses `useUserSessionStore` to fetch the current user's session and roles.
 * - The visibility of sections is controlled by user roles or the `showSection` property
 *   in the section data.
 * - The component supports multi-level menus with collapsible functionality.
 *
 * @example
 * ```tsx
 * <SidebarMenuItems />
 * ```
 *
 * @todo
 * - Implement proper handling of section visibility based on user roles.
 * - Replace the placeholder `onValueChange` handler in the `Accordion` component.
 */
const SidebarMenuItems = () => {
  // Get the state of the sidebar from the store
  const { sidebarExpand, sidebarMenuSections } = useBaseLayoutStore(
    useShallow((state) => ({
      sidebarExpand: state.sidebarExpand,
      sidebarMenuSections: state.sidebarMenuSections,
    })),
  );

  // Render the sidebar menu items
  return (
    <div className="flex-grow">
      {sidebarMenuSections?.map((sectionData, index) => (
        <div key={index}>
          <>
            <SectionHeader
              index={index}
              name={sectionData.sectionName}
              menuSectionsLength={sidebarMenuSections?.length}
            />
            <Accordion
              onValueChange={() => console.log("TODO")}
              type="single"
              collapsible
              className="w-full py-0"
            >
              {sectionData.menuItems?.map((menuItem, index) =>
                menuItem.subMenuItems ? (
                  <AccordionItem key={index} className="border-0" value={menuItem.name}>
                    {sidebarExpand && menuItem?.subMenuItems ? (
                      <>
                        <MultiLevelMenuButton Icon={menuItem.Icon} name={menuItem.name} />
                        <SubMenuItems items={menuItem?.subMenuItems} />
                      </>
                    ) : (
                      <CollapsedMultiLevelMenuButton
                        Icon={menuItem.Icon}
                        name={menuItem.name}
                        subMenuItems={menuItem.subMenuItems}
                      />
                    )}
                  </AccordionItem>
                ) : (
                  <div key={index}>
                    {sidebarExpand ? (
                      <SidebarMenuItem
                        Icon={menuItem.Icon}
                        name={menuItem.name}
                        route={menuItem.route}
                        badge={menuItem.badge}
                      />
                    ) : (
                      <CollapsedMenuItem
                        Icon={menuItem.Icon}
                        name={menuItem.name}
                        route={menuItem.route}
                      />
                    )}
                  </div>
                ),
              )}
            </Accordion>
          </>
        </div>
      ))}
    </div>
  );
};

export { SidebarMenuItems };
