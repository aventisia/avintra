import { DataFieldsDto } from "@/features/data-fields/dtos/data-fields-dtos";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/react-toolkit/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/react-toolkit/ui/popover";
import { Annotation } from "./PdfPreviewer";

interface FieldSelectionPopoverProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  setCurrentAnnotation: (
    value: React.SetStateAction<Annotation | null>,
  ) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  fieldTypes: DataFieldsDto[];
  assignTypeToAnnotation: (field: DataFieldsDto) => Promise<void>;
}

const FieldSelectionPopover = ({
  isOpen,
  setCurrentAnnotation,
  setIsOpen,
  triggerRef,
  fieldTypes,
  assignTypeToAnnotation,
}: FieldSelectionPopoverProps) => {
  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        setCurrentAnnotation(null);
      }}
    >
      <PopoverTrigger
        ref={triggerRef}
        className="m-0 h-0 w-0 border-none p-0"
      />
      <PopoverContent className="w-[200px] p-0" sideOffset={5}>
        <Command className="rounded-lg border shadow-md">
          <CommandInput placeholder="Search field..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {fieldTypes.map((field) => {
              return (
                <CommandItem
                  key={field.id}
                  value={field.id + field.name}
                  onSelect={() => {
                    if (field) assignTypeToAnnotation(field);
                    setIsOpen(false);
                  }}
                >
                  {field.name}
                </CommandItem>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default FieldSelectionPopover;
