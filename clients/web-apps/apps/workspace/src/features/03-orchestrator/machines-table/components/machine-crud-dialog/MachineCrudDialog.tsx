import { DTCrudDialogWrapper, DTViewModeEditButton } from "@avplatform/ui/data-table";
import { DialogContent, DialogDefaultHeader } from "@avplatform/ui/dialog";
import { ScrollArea } from "@avplatform/ui/scroll";
import { useDTCrudDialogStore } from "@avplatform/ui/stores";
import { useShallow } from "zustand/react/shallow";

import { getDialogHeadingDescription } from "../../constants";
import { MachineCrudForm } from "./MachineCrudForm";
import { MachineView } from "./MachineView";

export const MachineCrudDialog = ({ children }: React.PropsWithChildren) => {
  // Get crud dialog store state
  const {
    crudDialogOptions: { crudAction },
  } = useDTCrudDialogStore(
    useShallow((state) => ({
      crudDialogOptions: state.crudDialogOptions,
    })),
  );

  // Get dialog heading and description
  const dialogHeaderOptions = getDialogHeadingDescription(crudAction);

  // Return dialog
  return (
    <DTCrudDialogWrapper>
      {children}
      <DialogContent side={"right"} className="!max-w-[36rem]">
        <DialogDefaultHeader
          heading={dialogHeaderOptions.heading}
          description={dialogHeaderOptions.description}
        >
          {crudAction === "read" ? <DTViewModeEditButton /> : null}
        </DialogDefaultHeader>
        <ScrollArea className="h-[calc(100vh-4rem)] px-2.5 pb-0 pt-4">
          {crudAction === "read" ? <MachineView /> : <MachineCrudForm />}
        </ScrollArea>
      </DialogContent>
    </DTCrudDialogWrapper>
  );
};
