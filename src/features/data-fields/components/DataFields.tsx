import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
// import { AddFieldOptions } from "./add-field-dropdown/AddFieldDropdown";
import { ModelCrudDialog } from "./data-field-crud-dialog/DataFieldCrudDialog";
import DataFieldCard from "./DataFieldCard";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import { useShallow } from "zustand/react/shallow";
import { Tooltip } from "@/react-toolkit/ui/custom/Tooltip";

const AddFields = () => {
  // Get store state and actions
  const { setCrudDialogOptions } = useDTCrudDialogStore(
    useShallow((state) => ({
      setCrudDialogOptions: state.setCrudDialogOptions,
    })),
  );

  return (
    <div className="w-1/3 rounded-lg bg-white shadow">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <p>Fields</p>
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
              <PlusIcon className="h-4 w-4" />
            </Button>
          </Tooltip>
          {/* <AddFieldOptions /> */}
        </ModelCrudDialog>
      </div>

      <ScrollArea className="h-[calc(75vh)] p-4">
        <DataFieldCard />
      </ScrollArea>
    </div>
  );
};

export default AddFields;
