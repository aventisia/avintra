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
import { useFetchTenants } from "../hooks/useFetchTenants";
import { TenantCrudDialog } from "./tenant-crud-dialog/TenantCrudDialog";
import { tenantsTableColumns } from "./TenantsTableColumns";

/**
 * Renders a table of tenants.
 *
 * @returns The rendered TenantsTable component.
 */
export const TenantsTable = () => {
  // Set the document title to "Tenants".
  useDocumentTitle("Tenants");

  // Fetch tenants data
  const { data } = useFetchTenants();

  // Create a React table for tenants data
  const table = useDataTable(tenantsTableColumns, data?.data || []);

  // Return the rendered DataTable component.
  return (
    <>
      {data ? (
        <div className="space-y-4 pb-4 pt-[17px]">
          {/* Dialog root for tenant crud operation */}
          <TenantCrudDialog>
            <div className="flex items-center justify-between">
              {/* Heading of the tenant table */}
              <DTHeading heading={TABLE_HEADING} />

              {/* Search, view and create tenant container */}
              <div className="flex items-center gap-2">
                {/* Search box */}
                <DTSearchBox
                  table={table}
                  searchColumn={SEARCH_COLUMN}
                  placeholder="Search tenants..."
                />
                {/* Column view filter */}
                <DTViewOptions table={table} />
                <Separator orientation="vertical" className="mx-2 h-6" />
                {/* Create tenant button */}
                <DTCreateButton />
              </div>
            </div>
            {/* Data table container */}
            <div className="rounded-md border">
              {/* Main data table component to render the tenants data. */}
              <DataTable
                table={table}
                columnsLength={tenantsTableColumns.length}
              />
            </div>
          </TenantCrudDialog>
          {/* Data table Pagination component */}
          <DTPagination table={table} />
        </div>
      ) : (
        // Show data table skeleton while fetching the tenants data
        <DataTableSkeleton />
      )}
    </>
  );
};
