import { cn } from "@aventisia/ui/lib";
import { buttonVariants } from "@aventisia/ui/buttons";
import {
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@aventisia/ui/dropdown-menu";
import { DropdownMenu } from "@aventisia/ui/dropdown-menu";
import { PlusIcon } from "@heroicons/react/24/outline";
import { addFieldDropdownList } from "../../constants";
import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { useShallow } from "zustand/react/shallow";

export function AddFieldOptions() {
  // Get store state and actions
  const { setCrudDialogOptions } = useDTCrudDialogStore(
    useShallow((state) => ({
      setCrudDialogOptions: state.setCrudDialogOptions,
    })),
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon8" }),
          "cursor-pointer font-bold data-[state=open]:bg-muted",
        )}
      >
        <PlusIcon className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px] bg-white">
        {addFieldDropdownList.map((item) => {
          return (
            <SimpleDDMenuItem
              onClick={() =>
                setCrudDialogOptions({
                  showDialog: true,
                  rowId: window.crypto.randomUUID(),
                  crudAction: "create",
                })
              }
              content={item.name}
              Icon={item.icon}
            />
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
