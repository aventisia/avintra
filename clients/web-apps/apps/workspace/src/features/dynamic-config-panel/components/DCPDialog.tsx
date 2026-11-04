import { CrudDialogFormContextProvider, useCrudDialogChrome } from "@avplatform/ui/crud-dialog";
import { IconTile } from "@avplatform/ui/icon-tile";
import { SlidersHorizontalIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";

import { DCPForm, useDynamicConfigPanelStore } from "..";

const FormActionsSlot = () => {
  const chrome = useCrudDialogChrome();

  return <div ref={chrome?.setActionsSlot} className="flex items-center gap-2 [&>button]:h-9" />;
};

export const DCPDialog = ({ children }: React.PropsWithChildren) => {
  const { showDialog, setShowDialog, nodeLabel } = useDynamicConfigPanelStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
      nodeLabel: state.nodeLabel,
    })),
  );

  return (
    <>
      {children}
      {/* IMPORTANT NOTE: The CRUD dialog context gives the config fields card-dialog styles and
      lets the form's `CrudDialogActions` portal into this footer. */}
      <CrudDialogFormContextProvider onClose={() => setShowDialog(false)}>
        <CardDialog
          isOpen={showDialog}
          onClose={() => setShowDialog(false)}
          widthClassName="w-[min(32rem,calc(100vw-2rem))]"
          mark={
            <IconTile
              Icon={SlidersHorizontalIcon}
              size="lg"
              className="size-12 rounded-lg [&>svg]:size-6"
            />
          }
          eyebrow="Create new credential"
          title={nodeLabel || "Node configuration"}
          footer={
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <CardDialogButton onClick={() => setShowDialog(false)}>Cancel</CardDialogButton>
              <FormActionsSlot />
            </div>
          }
        >
          <DCPForm />
        </CardDialog>
      </CrudDialogFormContextProvider>
    </>
  );
};
