import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { DTCrudDialogWrapper } from "@aventisia/ui/data-table";
import { DialogContent, DialogDefaultHeader } from "@aventisia/ui/dialog";
import { useShallow } from "zustand/react/shallow";
import { getDialogHeadingDescription } from "../../constants";
import { ModelCrudForm } from "./ModelCrudForm";

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
          <ModelCrudForm />
        </div>
      </DialogContent>
    </DTCrudDialogWrapper>
  );
};
