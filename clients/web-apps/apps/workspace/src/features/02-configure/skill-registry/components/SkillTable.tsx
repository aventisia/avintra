import { EmptyState } from "@avplatform/ui";
import { DTCreateButton, DTHeading } from "@avplatform/ui/data-table";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { TableCNPagination, TableCNToolbar, useTableCN } from "@avplatform/ui/table-cn";
import { formatDate } from "@avplatform/ui/utils";
import { NavLink } from "react-router-dom";

import { QueryTabs } from "@/components/QueryTab";
import ResourceFlowAccessDialog from "@/features/resource-flow-access/components/resource-flow-access/ResourceFlowAccessDialog";
import ResourceUserAccessDialog from "@/features/resource-user-access/components/ResourceUserAccessDialog";
import { ResourceAccessTypeEnum } from "@/features/resource-user-access/enums/resource-access-type-enum";

import {
  SKILL_INITIAL_STATE,
  SKILL_PAGE_SIZE_OPTIONS,
  TABLE_HEADING,
  TABLE_KEY,
  TABLE_TAB_QUERY_PARAM,
  TABLE_VIEW_TABS,
} from "../constants";
import { useFetchSkills } from "../hooks/useFetchSkills.hook";
import { useTableTab } from "../hooks/useTableTab.hook";
import { SkillTableColumns } from "./SkillTableColumns";
import { SkillTableSkeleton } from "./SkillTableSkeleton";
import { SkillRowActions } from "./skill-row-actions/SkillRowActions";

const PAGINATION_PROPS = {
  pageSizeOptions: SKILL_PAGE_SIZE_OPTIONS,
  rowLabels: { singular: "Skill", plural: "Skills" },
};

/**
 * Renders a list of skills.
 */
export const SkillTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get the active tab and the query key used to invalidate the merged skills list
  const { isPlatformTab, isReadOnly, queryKey } = useTableTab();

  // Fetch skills data
  const { data } = useFetchSkills();

  // Create a TableCN table; page, size, and sorting live in the URL
  const { table } = useTableCN({
    data: data?.data || [],
    columns: SkillTableColumns(),
    getRowId: (skill) => skill.id ?? "",
    initialState: SKILL_INITIAL_STATE,
    persistKey: TABLE_KEY,
    searchColumns: ["name"],
  });

  // Return the rendered card list.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Page heading and tabs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DTHeading heading={TABLE_HEADING} />
              <QueryTabs tabs={TABLE_VIEW_TABS} key={TABLE_TAB_QUERY_PARAM} />
            </div>
            <div className="flex items-center gap-2">
              {!isReadOnly && <DTCreateButton buttonText="Add" entity="skill" />}
            </div>
          </div>
          {/* Search for the card list */}
          <TableCNToolbar table={table} searchPlaceholder="Search..." withViewOptions={false} />
          {/* TableCN with only rows and custom design */}
          {table.getRowModel().rows?.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 rounded-lg border bg-surface px-2.5 py-3">
              {table.getRowModel().rows.map((row) => (
                <NavLink
                  key={row.id}
                  to={`/configure/skill-registry/${row.original.id}?skill=${row.getValue("name")}${
                    isPlatformTab ? `&${TABLE_TAB_QUERY_PARAM}=platform` : ""
                  }`}
                >
                  <div className="flex flex-col cursor-pointer h-36 justify-between rounded-lg border bg-surface p-2.5 transition-colors hover:border-line-strong">
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between items-center">
                        <div className="flex max-w-80 items-center gap-3">
                          <div className="w-auto truncate text-sm font-medium">
                            {row.getValue("name")}
                          </div>
                          {row.original.accessLevel !== ResourceAccessTypeEnum.Personal && (
                            <span className="bg-muted border px-1 text-2xs leading-none h-[1.4rem] flex items-center justify-center text-ink-2 rounded-sm">
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
            <EmptyState
              className="rounded-lg border bg-surface py-8"
              primaryMessage="No skill found"
              secondaryMessage={isReadOnly ? undefined : "Please add a new skill."}
            />
          )}
          {/* Card list pagination */}
          <TableCNPagination table={table} {...PAGINATION_PROPS} />

          {/* Resource Share Dialog component */}
          <ResourceUserAccessDialog queryKey={queryKey} allowInProd />

          <ResourceFlowAccessDialog queryKey={queryKey} />
        </div>
      ) : (
        // Show data table skeleton while fetching the skills data
        <SkillTableSkeleton />
      )}
    </>
  );
};
