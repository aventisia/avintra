import { CollapsedMenuItem } from "@/react-toolkit/layout/sidebar/menu-items/CollapsedMenuItem";
import { CollapsedMultiLevelMenuButton } from "@/react-toolkit/layout/sidebar/menu-items/CollapsedMultiLevelMenuButton";
import { MultiLevelMenuButton } from "@/react-toolkit/layout/sidebar/menu-items/MultiLevelMenuButton";
import { SectionHeader } from "@/react-toolkit/layout/sidebar/menu-items/SectionHeader";
import { SidebarMenuItem } from "@/react-toolkit/layout/sidebar/menu-items/SidebarMenuItem";
import { SubMenuItems } from "@/react-toolkit/layout/sidebar/menu-items/SubMenuItems";
import { cn } from "@aventisia/ui/lib";
import { useBaseLayoutStore } from "@/react-toolkit/stores/base-layout-store";
import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { ISideNavMenuSection } from "@/react-toolkit/types/nav-data-types";
import { Accordion, AccordionItem } from "@/react-toolkit/ui/accordion";

interface SidebarMenuItemsProps {
  sideNavMenuSections?: ISideNavMenuSection[];
  className?: string;
}

const SidebarMenuItems = ({
  sideNavMenuSections,
  className,
}: SidebarMenuItemsProps) => {
  const { sidebarExpand } = useBaseLayoutStore();

  // Get user session state and actions
  const { userSession } = useUserSessionStore();

  return (
    <div className={cn("flex-grow", className)}>
      {sideNavMenuSections?.map((sectionData, index) => (
        <div key={index}>
          {/* TODO: Remove this once we have a way to handle this using user roles */}
          {userSession?.userRoles.includes("SA") || sectionData.showSection ? (
            <>
              <SectionHeader
                index={index}
                name={sectionData.sectionName}
                menuSectionsLength={sideNavMenuSections?.length}
              />
              <Accordion
                onValueChange={() => console.log("TODO")}
                type="single"
                collapsible
                className="w-full py-0"
              >
                {sectionData.menuItems?.map((menuItem, index) =>
                  menuItem.subMenuItems ? (
                    <AccordionItem
                      key={index}
                      className="border-0"
                      value={menuItem.name}
                    >
                      {sidebarExpand && menuItem?.subMenuItems ? (
                        <>
                          <MultiLevelMenuButton
                            Icon={menuItem.Icon}
                            name={menuItem.name}
                          />
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
          ) : (
            null
          )}
        </div>
      ))}
    </div>
  );
};

export { SidebarMenuItems };
