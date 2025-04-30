import { DTCreateButton } from "@/react-toolkit/ui/data-table/toolbar/DTCreateButton";

import { ColumnDef } from "@tanstack/react-table";

import { BillingAddressDto } from "../../dtos/billing-address-dto";
import { EditAddressButton } from "./EditAddressButton";

/**
 * Array of table columns for the billing address table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const AddressTableColumns: ColumnDef<BillingAddressDto>[] = [
  {
    accessorKey: "id",
    header: () => (
      <div className="flex items-center justify-between py-4">
        <h2 className="ml-1 flex w-full items-center truncate text-base font-medium text-foreground">
          My Addreses
        </h2>
        <DTCreateButton buttonText="Add Address" />
      </div>
    ),
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex content-between justify-between rounded-md border p-4 px-8 align-middle">
        <div className="flex flex-col gap-2">
          <p>Billing Address #{row.index}</p>
          <div className="flex flex-col space-y-1 text-muted-foreground">
            <p className="w-6/12 text-pretty">
              {row.original.addressLine1} {row.original.addressLine2}
              {row.original.pinCode} {row.original.city}
              {row.original.state} {row.original.country}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <EditAddressButton rowId={row.original.id} />
        </div>
      </div>
    ),
  },
];
