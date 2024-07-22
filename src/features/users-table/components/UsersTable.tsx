import {
  usersTableColumns,
  useFetchUsers,
  SEARCH_COLUMN,
  TABLE_HEADING,
  UserCrudDialogContent,
} from "@/features/users-table";
import { Dialog as CrudDialogRoot } from "@/react-toolkit/components/ui";
import { Separator } from "@/react-toolkit/components/ui";
import { useShallow } from "zustand/react/shallow";
import {
  DTCreateButton,
  DTHeading,
  DTPagination,
  DTSearchBox,
  DTViewOptions,
  DataTable,
  DataTableSkeleton,
  useDTCrudDialogStore,
  useDataTable,
} from "@/react-toolkit/components/data-table";
import { useDocumentTitle } from "@/react-toolkit/hooks";

/**
 * Renders a table of users.
 *
 * @returns The rendered UsersTable component.
 */
export const UsersTable = () => {
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

  // Fetch users data
  const { data } = useFetchUsers();

  // Create a React table for users data
  const table = useDataTable(usersTableColumns, data?.data || []);

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Dialog root for user crud operation */}
          <CrudDialogRoot
            open={showDialog}
            onOpenChange={() => setShowDialog(!showDialog)}
          >
            <div className="flex items-center justify-between">
              {/* Heading of the user table */}
              <DTHeading heading={TABLE_HEADING} />

              {/* Search, view and create user container */}
              <div className="flex items-center gap-2">
                {/* Search box */}
                <DTSearchBox
                  table={table}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search users..."
                />
                {/* Column view filter */}
                <DTViewOptions table={table} />
                <Separator orientation="vertical" className="mx-2 h-6" />
                {/* Create user button */}
                <DTCreateButton />
              </div>
            </div>
            {/* Data table container */}
            <div className="rounded-md border">
              {/* Main data table component to render the users data. */}
              <DataTable
                table={table}
                columnsLength={usersTableColumns.length}
              />
            </div>
            {/* Content of user curd dialog for create, read, update actions */}
            <UserCrudDialogContent />
          </CrudDialogRoot>
          {/* Data table Pagination component */}
          <DTPagination table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the users data
        <DataTableSkeleton />
      )}
    </>
  );
};
