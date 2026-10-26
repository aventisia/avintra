import {
  DTCreateButton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  getDataTablePreferences,
} from "@avplatform/ui/data-table";
import { useDataTable, useDocumentTitle } from "@avplatform/ui/hooks";
import { formatDate } from "@avplatform/ui/utils";
import { useMemo } from "react";
import { NavLink } from "react-router-dom";

import { QueryTabs } from "@/components/QueryTab";
import { HelpButton } from "@/components/help/HelpButton";
import ResourceFlowAccessDialog from "@/features/resource-flow-access/components/resource-flow-access/ResourceFlowAccessDialog";
import ResourceUserAccessDialog from "@/features/resource-user-access/components/ResourceUserAccessDialog";
import { ResourceAccessTypeEnum } from "@/features/resource-user-access/enums/resource-access-type-enum";

import { TABLE_HEADING, TABLE_KEY, TABLE_TAB_QUERY_PARAM, TABLE_VIEW_TABS } from "../constants";
import { columnVisibilityState } from "../constants/column-visibility-state.constant";
import { useFetchSkills } from "../hooks/useFetchSkills.hook";
import { useTableTab } from "../hooks/useTableTab.hook";
import { SkillTableColumns } from "./SkillTableColumns";
import { SkillTableSkeleton } from "./SkillTableSkeleton";
import { SkillRowActions } from "./skill-row-actions/SkillRowActions";

/**
 * Renders a list of skills.
 */
export const SkillTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get data-table preferences from local storage
  const { columnVisibility, sortState } = getDataTablePreferences(TABLE_KEY, columnVisibilityState);

  // Get the active tab and the query key used to invalidate the merged skills list
  const { isPlatformTab, isReadOnly, queryKey } = useTableTab();

  // Fetch skills data
  const { data } = useFetchSkills();

  const skillTableColumnsArray = useMemo(() => SkillTableColumns(isPlatformTab), [isPlatformTab]);

  // Create a React table for skills data
  const table = useDataTable(
    skillTableColumnsArray,
    data?.data || [],
    columnVisibility,
    sortState,
    true,
  );

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Table toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DTHeading heading={TABLE_HEADING} />
              <HelpButton guideId="skills" />
              <QueryTabs tabs={TABLE_VIEW_TABS} key={TABLE_TAB_QUERY_PARAM} />
            </div>
            <div className="flex items-center gap-2">
              <DTSearchBox table={table} searchColumns={["name"]} placeholder="Search..." />
              {!isReadOnly && <DTCreateButton buttonText="Add" entity="skill" />}
            </div>
          </div>
          {/* DT with only rows and custom design */}
          {table.getRowModel().rows?.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 rounded-lg border bg-white px-2.5 py-3">
              {table.getRowModel().rows.map((row) => (
                <NavLink
                  key={row.id}
                  to={`/configure/skill-registry/${row.original.id}?skill=${row.getValue("name")}${
                    isPlatformTab ? `&${TABLE_TAB_QUERY_PARAM}=platform` : ""
                  }`}
                >
                  <div className="flex flex-col cursor-pointer h-36 justify-between rounded-lg border bg-background p-2.5 shadow-sm transition-shadow hover:border-primary-200 hover:ring-1 hover:ring-primary-200">
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between items-center">
                        <div className="flex max-w-80 items-center gap-3">
                          <div className="w-auto truncate text-sm font-medium">
                            {row.getValue("name")}
                          </div>
                          {row.original.accessLevel !== ResourceAccessTypeEnum.Personal && (
                            <span className="bg-muted border px-1 text-2xs leading-none h-[1.4rem] flex items-center justify-center text-primary rounded-full">
                              {row.original.accessLevel?.replace(/([A-Z])/g, " $1")}
                            </span>
                          )}
                        </div>
                        {/* Action trigger */}
                        <SkillRowActions
                          rowId={row.original.id || ""}
                          accessLevel={row.original.accessLevel}
                          isTenantWideAccess={row.original.isTenantWideAccess || false}
                          isResourceAccessRestricted={
                            row.original.isResourceAccessRestricted || false
                          }
                          name={row.original.name}
                          isPlatformSkill={isPlatformTab}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground line-clamp-3">
                        {row.getValue("description") as string}
                      </span>
                    </div>
                    <div className="border-t py-2.5 h-7 w-full">
                      <p className="text-xs text-muted-foreground">
                        Created on {formatDate(row.getValue("createdOn"))}
                      </p>
                    </div>
                  </div>
                </NavLink>
              ))}
            </div>
          ) : (
            <div className="flex h-24 flex-col items-center justify-center gap-3 rounded-lg border bg-white px-2.5 py-3">
              <p className="text-sm text-muted-foreground">
                No skill found. {isReadOnly ? "" : "Please add a new skill."}
              </p>
            </div>
          )}
          {/* Data table Pagination component */}
          <DTPagination table={table} singularLabel="Skill" pluralLabel="Skills" />

          {/* Resource Share Dialog component */}
          <ResourceUserAccessDialog queryKey={queryKey} />

          <ResourceFlowAccessDialog queryKey={queryKey} />
        </div>
      ) : (
        // Show data table skeleton while fetching the skills data
        <SkillTableSkeleton />
      )}
    </>
  );
};
