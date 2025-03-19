import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
// import { AddFieldOptions } from "./add-field-dropdown/AddFieldDropdown";
import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { Tooltip } from "@/react-toolkit/ui/custom/Tooltip";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";
import { ModelCrudDialog } from "./data-field-crud-dialog/DataFieldCrudDialog";
import DataFieldList from "./DataFieldList";
import { useAnnotationDataStore } from "@/features/label-data/stores/annotation-data-store";
import SavingIndicator from "./SavingIndicator";

const AddFields = () => {
  // Get store state and actions
  const { setCrudDialogOptions } = useDTCrudDialogStore(
    useShallow((state) => ({
      setCrudDialogOptions: state.setCrudDialogOptions,
    })),
  );

  // Get store state and actions
  const { isDataSaving } = useAnnotationDataStore(
    useShallow((state) => ({
      isDataSaving: state.isDataSaving,
    })),
  );

  return (
    <div className="col-span-1 ml-2 rounded-lg bg-white shadow">
      <div className="flex h-12 items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <p className="text-md font-medium">Fields</p>
          <SavingIndicator isSaving={isDataSaving} />
        </div>
          <ModelCrudDialog>
            <Tooltip content="Add field">
              <Button
                variant={"ghost"}
                size="icon8"
                onClick={() =>
                  setCrudDialogOptions({
                    showDialog: true,
                    rowId: window.crypto.randomUUID(),
                    crudAction: "create",
                  })
                }
              >
                <PlusIcon className="h-5 w-5" />
              </Button>
            </Tooltip>
            {/* <AddFieldOptions /> */}
          </ModelCrudDialog>
      </div>

      <ScrollArea className="h-[calc(100vh-7.6rem)] p-4">
        <DataFieldList />
      </ScrollArea>
    </div>
  );
};

export default AddFields;
