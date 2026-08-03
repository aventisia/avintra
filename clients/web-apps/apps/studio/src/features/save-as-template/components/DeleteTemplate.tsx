import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { useShowAlertHandler } from "@avplatform/ui/hooks";

import { useDeleteTemplateMutation } from "../hooks/useDeleteTemplateMutation";

const DeleteTemplate = ({ id }: { id: string }) => {
  const { showDefaultAlertDialog } = useShowAlertHandler();

  const { mutate: deleteTemplate, isPending } = useDeleteTemplateMutation();
  return (
    <Button
      disabled={isPending}
      type="button"
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
