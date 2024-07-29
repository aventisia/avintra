import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import { DTCrudDialogWrapper } from "@/react-toolkit/ui/data-table/DTCrudDialogWrapper";
import {
  DialogContent,
  DialogDefaultHeader,
} from "@/react-toolkit/ui/dialog/Dialog";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { useShallow } from "zustand/react/shallow";
import { getDialogHeadingDescription } from "../../constants/constants";
import { TenantCrudForm } from "./TenantCrudForm";

export const TenantCrudDialog = ({ children }: React.PropsWithChildren) => {
  // Get crud dialog store to show dialog state
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
        <ScrollArea className="h-[calc(100vh-3.8rem)] px-2.5 pb-0 pt-4">
          <TenantCrudForm />
        </ScrollArea>
      </DialogContent>
    </DTCrudDialogWrapper>
  );
};
