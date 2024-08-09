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
import { SEARCH_COLUMN, TABLE_HEADING } from "../constants/constants";
import { useFetchUsers } from "../hooks/useFetchUsers";
import { UserCrudDialog } from "./user-crud-dialog/UserCrudDialog";
import { usersTableColumns } from "./UsersTableColumns";

/**
 * Renders a table of users.
 *
 * @returns The rendered UsersTable component.
 */
export const UsersTable = () => {
  // Set the document title
  useDocumentTitle(TABLE_HEADING);

  // Fetch users data
  const { data } = useFetchUsers();

  // Create a React table for users data
  const table = useDataTable(usersTableColumns, data?.data || []);

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Dialog for user crud operation */}
          <UserCrudDialog>
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
          </UserCrudDialog>
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
