import { useDataTable } from "@/react-toolkit/hooks/useDataTable";
import { useDocumentTitle } from "@/react-toolkit/hooks/useDocumentTitle";
import { DataTable } from "@/react-toolkit/ui/data-table/DataTable";
import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { DTPagination } from "@/react-toolkit/ui/data-table/DTPagination";
import { DTCreateButton } from "@/react-toolkit/ui/data-table/toolbar/DTCreateButton";
import { DTHeading } from "@/react-toolkit/ui/data-table/toolbar/DTHeading";
import { DTSearchBox } from "@/react-toolkit/ui/data-table/toolbar/DTSearchBox";
import { DTViewOptions } from "@/react-toolkit/ui/data-table/toolbar/DTViewOptions";
import { Separator } from "@/react-toolkit/ui/separator";
import { SEARCH_COLUMN, TABLE_HEADING } from "../constants/constants";
import { useFetchProjects } from "../hooks/useFetchProjects";
import { ProjectCrudDialog } from "./project-crud-dialog/ProjectCrudDialog";
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
  const table = useDataTable(projectsTableColumns, data?.data || []);

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Dialog for project crud operation */}
          <ProjectCrudDialog>
            <div className="flex items-center justify-between">
              {/* Heading of the project table */}
              <DTHeading heading={TABLE_HEADING} />

              {/* Search, view and create project container */}
              <div className="flex items-center gap-2">
                {/* Search box */}
                <DTSearchBox
                  table={table}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search projects..."
                />
                {/* Column view filter */}
                <DTViewOptions table={table} />
                <Separator orientation="vertical" className="mx-2 h-6" />
                {/* Create project button */}
                <DTCreateButton />
              </div>
            </div>
            {/* Data table container */}
            <div className="rounded-md border">
              {/* Main data table component to render the projects data. */}
              <DataTable
                table={table}
                columnsLength={projectsTableColumns.length}
              />
            </div>
          </ProjectCrudDialog>
          {/* Data table Pagination component */}
          <DTPagination table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the projects data
        <DataTableSkeleton />
      )}
    </>
  );
};
