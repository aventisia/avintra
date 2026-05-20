import { LoadingSpinner } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { useShowAlertHandler } from "@aventisia/ui/hooks";

import { useDeleteTemplateMutation } from "../hooks/useDeleteTemplateMutation";

const DeleteTemplate = ({ id }: { id: string }) => {
  const { showDefaultAlertDialog } = useShowAlertHandler();

  const { mutate: deleteTemplate, isPending } = useDeleteTemplateMutation();
  return (
    <Button
      disabled={isPending}
      type="button"
      size={"sm"}
      variant={"caution"}
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () => deleteTemplate(id),
          alertType: "delete-record",
          additionalText: "template",
        });
      }}
    >
      {isPending ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null}
      Delete
    </Button>
  );
};

export default DeleteTemplate;
