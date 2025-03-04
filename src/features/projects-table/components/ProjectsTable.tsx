import { useDataTable } from "@/react-toolkit/hooks/useDataTable";
import { useDocumentTitle } from "@/react-toolkit/hooks/useDocumentTitle";
import { DataTable } from "@/react-toolkit/ui/data-table";
import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { DTPagination } from "@/react-toolkit/ui/data-table/DTPagination";
import { DTCreateButton } from "@/react-toolkit/ui/data-table/toolbar/DTCreateButton";
import { DTHeading } from "@/react-toolkit/ui/data-table/toolbar/DTHeading";
import { DTSearchBox } from "@/react-toolkit/ui/data-table/toolbar/DTSearchBox";
import { DTViewOptions } from "@/react-toolkit/ui/data-table/toolbar/DTViewOptions";
import { Separator } from "@/react-toolkit/ui/separator";

import { SEARCH_COLUMN, TABLE_HEADING } from "../constants";
import { columnDisplayNames } from "../constants/column-display-names";
import { columnVisibilityState } from "../constants/column-visibility-state";
import { useFetchProjects } from "../hooks/useFetchProjects";
import { ProjectCrudDialog } from "./project-crud-dialog/ProjectCrudDialog";
import { ProjectsBulkActions } from "./ProjectsBulkActions";
import { projectsTableColumns } from "./ProjectsTableColumns";

/**
 * Renders a table of projects.
 *
 * @returns The rendered ProjectsTable component.
 */
export const ProjectsTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Fetch projects data
  const { data } = useFetchProjects();

  // Create a React table for projects data
  const table = useDataTable(
    projectsTableColumns,
    data?.data || [],
    columnVisibilityState,
    true,
  );

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Crud ops dialog */}
          <ProjectCrudDialog>
            {/* Table toolbar */}
            <div className="flex items-center justify-between">
              <DTHeading heading={TABLE_HEADING} />

              <div className="flex items-center gap-2">
                <DTSearchBox
                  table={table}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search projects..."
                />
                <DTViewOptions {...{ table, columnDisplayNames }} />
                <Separator orientation="vertical" className="mx-2 h-6" />
                <DTCreateButton />
              </div>
            </div>

            {/* Data table to render data */}
            <div className="rounded-md border bg-slate-50">
              <DataTable
                table={table}
                columnsLength={projectsTableColumns.length}
              />
            </div>
          </ProjectCrudDialog>

          {/* Data table Pagination component */}
          <DTPagination table={table} />

          {/* Bulk actions for data table */}
          <ProjectsBulkActions table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the projects data
        <DataTableSkeleton />
      )}
    </>
  );
};
