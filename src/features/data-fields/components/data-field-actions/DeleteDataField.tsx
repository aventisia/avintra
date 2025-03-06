import { useListOptimisticMutation } from "@/react-toolkit/hooks/useListOptimisticMutation";
import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { cn } from "@/react-toolkit/lib/utils";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { Trash2 } from "lucide-react";
import { DATA_QUERY_KEY } from "../../constants";
import { DataFieldsDto } from "../../dtos/data-fields-dtos";
import { dataFieldOptimisticMutationFn } from "../../apis/add-fields-apis";
import { removeFieldById } from "@/features/pdf-previewer/utils";
import { useAnnotationDataStore } from "@/features/label-data/stores/annotation-data-store";
import { useShallow } from "zustand/react/shallow";

interface DeleteDataFieldProps {
  id: string;
}

export const DeleteDataField = ({ id }: DeleteDataFieldProps) => {
  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();
  const { currAnnotationObj, setAnnotationObject } = useAnnotationDataStore(
    useShallow((state) => ({
      currAnnotationObj: state.currAnnotationObj,
      setAnnotationObject: state.setAnnotationObject,
    })),
  );

  // Get mutation function to delete the model
  const { mutate: deleteModel } = useListOptimisticMutation<
    string,
    DataFieldsDto | boolean,
    DataFieldsDto
  >([id], dataFieldOptimisticMutationFn, DATA_QUERY_KEY);

  // Return Delete alert dialog trigger
  return (
    <div
      onClick={() => {
        showDefaultAlertDialog({
          confirmActionFn: () => {
            deleteModel({
              payload: id,
              crudAction: "delete",
            });
            setAnnotationObject(removeFieldById(currAnnotationObj, id));
          },
          alertType: "delete-record",
          additionalText: "field",
        });
      }}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon8" }),
        "cursor-pointer data-[state=open]:bg-muted",
      )}
    >
      <Trash2 className="h-4 w-4 text-[--icon-color]" />
    </div>
  );
};
