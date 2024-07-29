import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { cn } from "@/react-toolkit/lib/utils";
import { useShowAlertHandler } from "@/react-toolkit/ui/alert-dialog/hooks/useShowAlertHandler";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { DropdownMenuItem } from "@/react-toolkit/ui/dropdown-menu";
import { TrashIcon } from "@heroicons/react/24/outline";
import { TenantsTableDto } from "../dtos/tenants-table-dto";
import { tenantOptimisticMutationFn } from "../apis/tenants-table-apis";
import { DATA_QUERY_KEY } from "../constants/constants";

interface DeleteActionProps {
  tenantId: string;
}

/**
 * Renders the delete action for a tenant row item.
 * This component displays a dropdown menu item with a delete button.
 */
export const TenantDeleteRowAction = ({ tenantId }: DeleteActionProps) => {
  // Get showAlert handler
  const { showAlertDialog } = useShowAlertHandler();

  // Get mutation function to delete the tenant
  const { mutate: deleteTenant } = useListOptimisticMutation<
    string,
    TenantsTableDto | boolean,
    TenantsTableDto
  >(tenantOptimisticMutationFn, DATA_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <DropdownMenuItem
      className={cn(buttonVariants({ variant: "dropdownCautionItem" }), "group h-8")}
      onClick={() => {
        showAlertDialog({
          confirmActionFn: () => {
            // Delete the flow
            deleteTenant({
              id: tenantId,
              payload: tenantId,
              crudAction: "delete",
            });
          },
          title: "Delete tenant",
          description:
            "This action cannot be undone. Are you sure you want to delete this tenant?",
          confirmBtnText: "Yes, delete tenant",
        });
      }}
    >
      <TrashIcon className="mb-[2px] h-4 w-4 text-destructive group-focus:text-white" />
      Delete
    </DropdownMenuItem>
  );
};
