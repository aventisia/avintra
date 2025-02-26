import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import { DTCrudDialogWrapper } from "@/react-toolkit/ui/data-table/DTCrudDialogWrapper";
import { DialogContent, DialogDefaultHeader } from "@/react-toolkit/ui/dialog";
import { useShallow } from "zustand/react/shallow";
import { getDialogHeadingDescription } from "../../constants";
import { DataFieldCrudForm } from "./DataFieldCrudForm";

export const ModelCrudDialog = ({ children }: React.PropsWithChildren) => {
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
      <DialogContent side={"right"} className="!max-w-[32rem]">
        <DialogDefaultHeader
          className="px-3.5 py-3 text-lg tracking-wide"
          heading={dialogHeaderOptions.heading}
          description={dialogHeaderOptions.description}
        />
        <div className="px-2.5 pb-0 pt-4">
          <DataFieldCrudForm />
        </div>
      </DialogContent>
    </DTCrudDialogWrapper>
  );
};
