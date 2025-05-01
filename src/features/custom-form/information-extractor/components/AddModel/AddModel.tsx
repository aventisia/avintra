import { Button } from "@/react-toolkit/ui/buttons/Button";
import { Trash2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { addInfoExtractorFormZodSchema } from "../../constants/add-info-extractor-zod-schema";
import ModelSelectDropdown from "./ModelSelectDropdown";
import { Separator } from "@/react-toolkit/ui/separator";
import { useAddModelStore } from "../../stores/add-model-store";
import { useShallow } from "zustand/react/shallow";
import { PlusIcon } from "@heroicons/react/24/outline";

interface AddModelProps {
  form: UseFormReturn<z.infer<typeof addInfoExtractorFormZodSchema>>;
}

const AddModel = ({ form }: AddModelProps) => {
  const selectedModelValue = form.watch("selectedModel");
  const { showAddModelDropdownContainer, setShowAddModelDropdownContainer } =
    useAddModelStore(
      useShallow((state) => ({
        showAddModelDropdownContainer: state.showAddModelDropdownContainer,
        setShowAddModelDropdownContainer:
          state.setShowAddModelDropdownContainer,
      })),
    );

  return (
    <>
      {/* Add Model Button */}
      {!selectedModelValue && (
        <Button
          size="xs"
          className="w-full space-x-0.5 text-sm"
          type="button"
          onClick={() => setShowAddModelDropdownContainer(true)}
        >
          <PlusIcon className="h-4 w-4 stroke-2" /> <span>Add Model</span>
        </Button>
      )}

      {/* Model Select Dropdown */}
      {showAddModelDropdownContainer && (
        <div className="mt-2">
          <ModelSelectDropdown form={form} />
        </div>
      )}

      {/* Selected Model Display card */}
      {selectedModelValue && (
        <div className="rounded-lg border bg-muted p-3">
          <p className="text-base">Selected Model</p>
          <Separator className="my-2 h-[0.5px] w-full" />
          <div className="flex items-center justify-between">
            <p className="text-sm">{selectedModelValue}</p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="h-4 w-4 p-0"
                onClick={() => form.setValue("selectedModel", null)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddModel;
