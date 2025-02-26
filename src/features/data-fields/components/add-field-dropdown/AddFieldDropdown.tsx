import { cn } from "@/react-toolkit/lib/utils";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import {
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/react-toolkit/ui/dropdown-menu";
import { DropdownMenu } from "@/react-toolkit/ui/dropdown-menu/DropdownMenu";
import { PlusIcon } from "@heroicons/react/24/outline";
import { addFieldDropdownList } from "../../constants";
import { SimpleDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/SimpleDDMenuItem";
import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
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
