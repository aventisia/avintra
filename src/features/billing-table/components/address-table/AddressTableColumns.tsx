import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { BillingAddressDto } from "../../dtos/billing-address-dto";

/**
 * Array of table columns for the billing address table.
 * Each column object contains an accessorKey, header component, and cell component.
 */
export const AddressTableColumns: ColumnDef<BillingAddressDto>[] = [
  {
    accessorKey: "id",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex content-between justify-between rounded-md border p-4 px-8 align-middle">
        <div className="flex flex-col gap-2">
          <p>Billing Address #{row.index}</p>
          <div className="flex flex-col space-y-1 text-muted-foreground">
            <p>address</p>
            <p>pincode city</p>
            <p>state country</p>
          </div>
        </div>
        <div className="flex items-center">
          <Button className="bg-primary-100" variant="outline">
            Edit
          </Button>
        </div>
      </div>
    ),
  },
];
