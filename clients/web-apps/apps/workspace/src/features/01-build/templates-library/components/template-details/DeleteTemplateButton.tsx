import { LoadingSpinner } from "@avplatform/ui";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { TrashIcon } from "@phosphor-icons/react";

import { UseTemplateDTO } from "../../dtos/use-template-dto";
import { useDeleteTemplateMutation } from "../../hooks/useDeleteTemplateMutation";

export const DeleteTemplateButton = ({ template }: { template: UseTemplateDTO }) => {
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const { mutate: deleteTemplate, isPending } = useDeleteTemplateMutation();

  return (
    <button
      type="button"
      disabled={isPending}
      aria-busy={isPending}
      aria-label={`Delete template ${template.name}`}
      title="Delete template"
      onClick={() =>
        showDefaultAlertDialog({
          confirmActionFn: () => deleteTemplate(template.id),
          alertType: "delete-record",
          additionalText: "template",
        })
      }
      className="grid size-8 place-items-center rounded-md text-muted-foreground outline-none transition hover:bg-bad/10 hover:text-bad focus-visible:ring-2 focus-visible:ring-focus disabled:pointer-events-none disabled:opacity-60"
    >
      {isPending ? <LoadingSpinner className="size-4" /> : <TrashIcon className="size-4" />}
    </button>
  );
};
