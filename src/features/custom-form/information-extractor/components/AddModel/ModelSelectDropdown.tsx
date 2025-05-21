import { Button } from "@aventisia/ui/buttons";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@aventisia/ui/command";
import { FormControl } from "@aventisia/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/react-toolkit/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Switch } from "@aventisia/ui";
import { cn } from "@aventisia/ui/lib";
import { UseFormReturn } from "react-hook-form";
import { addInfoExtractorFormZodSchema } from "../../constants/add-info-extractor-zod-schema";
import { z } from "zod";
import { useAddModelStore } from "../../stores/add-model-store";
import { useShallow } from "zustand/react/shallow";

interface ModelSelectDropdownProps {
  form: UseFormReturn<z.infer<typeof addInfoExtractorFormZodSchema>>;
}

const ModelSelectDropdown = ({ form }: ModelSelectDropdownProps) => {
  const {
    defaultModels,
    customModels,
    defaultModelToShow,
    isSelectModelPopoverOpen,
    setDefaultModelToShow,
    setIsModelPopoverOpen,
    setShowAddModelDropdownContainer,
  } = useAddModelStore(
    useShallow((state) => ({
      defaultModels: state.defaultModels,
      customModels: state.customModels,
      defaultModelToShow: state.defaultModelToShow,
      isSelectModelPopoverOpen: state.isSelectModelPopoverOpen,
      setDefaultModelToShow: state.setDefaultModelToShow,
      setIsModelPopoverOpen: state.setIsModelPopoverOpen,
      setShowAddModelDropdownContainer: state.setShowAddModelDropdownContainer,
    })),
  );

  const { watch, setValue } = form;

  const selectedModelValue = watch("selectedModel");

  return (
    <Popover
      open={isSelectModelPopoverOpen}
      onOpenChange={setIsModelPopoverOpen}
    >
      <span className="px-1 text-xs font-semibold">Select Model</span>
      <PopoverTrigger asChild className="!mt-0.5">
        <FormControl>
          <Button
            variant="outline"
            size="sm"
            role="combobox"
            className={cn(
              "w-full justify-between pl-3 pr-[0.68rem] font-normal",
              !selectedModelValue && "text-muted-foreground",
            )}
          >
            {selectedModelValue ? selectedModelValue : "Select Model"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 py-2 pt-3">
        <div className="flex items-center justify-between px-2">
          <p className="text-sm">Choose from model library</p>
          <Switch
            size="sm"
            checked={!defaultModelToShow}
            onCheckedChange={() => setDefaultModelToShow(!defaultModelToShow)}
          />
        </div>
        <Command>
          <CommandInput placeholder="Please select a model" />
          <CommandEmpty>No result found</CommandEmpty>
          <CommandGroup>
            {(defaultModelToShow ? defaultModels : customModels).map(
              (item, index) => (
                <CommandItem
                  value={item.label}
                  key={index}
                  onSelect={() => {
                    setValue("selectedModel", item.value);
                    setIsModelPopoverOpen(false);
                    setShowAddModelDropdownContainer(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      item.value === selectedModelValue
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {item.label}
                </CommandItem>
              ),
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ModelSelectDropdown;
