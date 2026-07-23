import { DTCrudDialogWrapper } from "@avplatform/ui/data-table";
import { DialogContent, DialogDefaultHeader } from "@avplatform/ui/dialog";
import { ScrollArea } from "@avplatform/ui/scroll";
import { useDTCrudDialogStore } from "@avplatform/ui/stores";
import { useShallow } from "zustand/react/shallow";

import { JobCreateForm, JobUpdateForm, getDialogHeadingDescription } from "../..";

export const JobCrudDialog = ({ children }: React.PropsWithChildren) => {
  const {
    crudDialogOptions: { crudAction, rowId },
  } = useDTCrudDialogStore(
    useShallow((state) => ({
      crudDialogOptions: state.crudDialogOptions,
    })),
  );

  const dialogHeaderOptions = getDialogHeadingDescription(crudAction);

  return (
    <DTCrudDialogWrapper>
      {children}
      <DialogContent side={"right"} className="!max-w-[36rem]">
        <DialogDefaultHeader
          heading={dialogHeaderOptions.heading}
          description={dialogHeaderOptions.description}
        />
        <ScrollArea className="h-[calc(100vh-4rem)] px-2.5 pb-0 pt-4">
          {crudAction === "create" ? <JobCreateForm /> : <JobUpdateForm key={rowId} />}
        </ScrollArea>
      </DialogContent>
    </DTCrudDialogWrapper>
  );
};
