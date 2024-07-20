import {
  flowsTableColumns,
  useFetchFlows,
  SEARCH_COLUMN,
  FlowCrudDialogContent,
  useFlowsQueryKey,
  FlowsTableHeading,
} from "@/features/flows-table";
import { Dialog as CrudDialogRoot } from "@/react-toolkit/components/ui";
import { Separator } from "@/react-toolkit/components/ui";
import { useShallow } from "zustand/react/shallow";
import {
  DTCreateButton,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  DataTable,
  DataTableSkeleton,
  useDTCrudDialogStore,
  useDataTable,
} from "@/react-toolkit/components/data-table";

/**
 * Renders a table of flows.
 *
 * @returns The rendered FlowsTable component.
 */
export const FlowsTable = () => {
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

  // Set flows query key, projectId and projectName in store
  useFlowsQueryKey();

  // Fetch flows data
  const { data } = useFetchFlows();

  // Create a React table for flows data
  const table = useDataTable(flowsTableColumns, data?.data || []);

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Dialog root for flow crud operation */}
          <CrudDialogRoot
            open={showDialog}
            onOpenChange={() => setShowDialog(!showDialog)}
          >
            <div className="flex items-center justify-between">
              {/* Heading of the flow table */}
              <FlowsTableHeading />

              {/* Search, view and create flow container */}
              <div className="flex items-center gap-2">
                {/* Search box */}
                <DTSearchBox
                  table={table}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search flows..."
                />
                {/* Column view filter */}
                <DTViewOptions table={table} />
                <Separator orientation="vertical" className="mx-2 h-6" />
                {/* Create flow button */}
                <DTCreateButton buttonText="Create Flow" />
              </div>
            </div>
            {/* Data table container */}
            <div className="rounded-md border">
              {/* Main data table component to render the flows data. */}
              <DataTable
                table={table}
                columnsLength={flowsTableColumns.length}
              />
            </div>
            {/* Content of flow curd dialog for create, read, update actions */}
            <FlowCrudDialogContent />
          </CrudDialogRoot>
          {/* Data table Pagination component */}
          <DTPagination table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the flows data
        <DataTableSkeleton />
      )}
    </>
  );
};
