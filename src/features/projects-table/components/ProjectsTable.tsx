import { useDocumentTitle } from "@/react-toolkit/hooks/useDocumentTitle";
import { DataTable } from "@/react-toolkit/ui/data-table/DataTable";
import { DataTableSkeleton } from "@/react-toolkit/ui/data-table/DataTableSkeleton";
import { DTPagination } from "@/react-toolkit/ui/data-table/DTPagination";
import { useDataTable } from "@/react-toolkit/ui/data-table/hooks/useDataTable";
import { useDTCrudDialogStore } from "@/react-toolkit/ui/data-table/stores/dt-crud-dialog-store";
import { DTCreateButton } from "@/react-toolkit/ui/data-table/toolbar/DTCreateButton";
import { DTHeading } from "@/react-toolkit/ui/data-table/toolbar/DTHeading";
import { DTSearchBox } from "@/react-toolkit/ui/data-table/toolbar/DTSearchBox";
import { DTViewOptions } from "@/react-toolkit/ui/data-table/toolbar/DTViewOptions";
import { Dialog as CrudDialogRoot } from "@/react-toolkit/ui/dialog/Dialog";
import { Separator } from "@/react-toolkit/ui/separator";
import { useShallow } from "zustand/react/shallow";
import { SEARCH_COLUMN, TABLE_HEADING } from "../constants/constants";
import { useFetchProjects } from "../hooks/useFetchProjects";
import { ProjectCrudDialogContent } from "./ProjectCrudDialogContent";
import { projectsTableColumns } from "./ProjectsTableColumns";

/**
 * Renders a table of projects.
 *
 * @returns The rendered ProjectsTable component.
 */
export const ProjectsTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Get crud dialog store to show dialog state
  const {
    crudDialogOptions: { showDialog },
    setShowDialog,
  } = useDTCrudDialogStore(
    useShallow((state) => ({
      crudDialogOptions: state.crudDialogOptions,
      setShowDialog: state.setShowDialog,
    })),
  );

  // Fetch projects data
  const { data } = useFetchProjects();

  // Create a React table for projects data
  const table = useDataTable(projectsTableColumns, data?.data || []);

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Dialog root for project crud operation */}
          <CrudDialogRoot
            open={showDialog}
            onOpenChange={() => setShowDialog(!showDialog)}
          >
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
            {/* Content of project curd dialog for create, read, update actions */}
            <ProjectCrudDialogContent />
          </CrudDialogRoot>
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
