import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { AddFieldOptions } from "./add-field-dropdown/AddFieldDropdown";
import { ModelCrudDialog } from "./data-field-crud-dialog/DataFieldCrudDialog";
import DataFieldCard from "./DataFieldCard";

const AddFields = () => {
  return (
    <div className="w-1/3 rounded-lg bg-white shadow">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <p>Fields</p>
        <ModelCrudDialog>
          <AddFieldOptions />
        </ModelCrudDialog>
      </div>

      <ScrollArea className="h-[calc(75vh)] p-4">
        <DataFieldCard />
      </ScrollArea>
    </div>
  );
};

export default AddFields;
