import { DeleteDDMenuItem } from "@aventisia/ui/dropdown-menu";

interface FLIDeleteActionProps {
  flowId: string;
}

/**
 * Renders the delete action for a flow list item.
 * This component displays a dropdown menu item with a delete button.
 */
export const AAIDeleteAction = ({ flowId }: FLIDeleteActionProps) => {
  // Return Delete alert dialog trigger
  return (
    <DeleteDDMenuItem
      size="sm"
      onClick={() => {
        console.log(flowId);
      }}
    />
  );
};
