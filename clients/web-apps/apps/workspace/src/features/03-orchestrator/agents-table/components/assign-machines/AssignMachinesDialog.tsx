import { IconTile } from "@avplatform/ui/icon-tile";
import { MonitorIcon, PlusIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { StatusLine } from "@/components/card-dialog/StatusLine";
import { pluralize } from "@/utils/pluralize.util";

import { useSearchMultiSelect } from "../../hooks/useSearchMultiSelect";
import { useAssignMachineStore } from "../../stores/assign-machine-store";
import { AssignMachineSearch } from "./AssignMachineSearch";
import MachinesList from "./MachinesList";

const AssignMachinesDialog = () => {
  const { open, setOpen, setView, view, flowName } = useAssignMachineStore(
    useShallow((state) => ({
      open: state.showDialog,
      setOpen: state.setShowDialog,
      setView: state.setView,
      view: state.view,
      flowName: state.flowName,
    })),
  );
  const search = useSearchMultiSelect();
  const isSearchView = view === "Search";
  const selectedCount = search.selectedItems.length;

  const showMachines = () => {
    search.handleClearAll();
    search.setSearchTerm("");
    setView("Machines");
  };

  const handleClose = () => {
    showMachines();
    setOpen(false);
  };

  return (
    <CardDialog
      isOpen={open}
      onClose={handleClose}
      isDismissLocked={search.isPending}
      isOutsideClickLocked={isSearchView && selectedCount > 0}
      mark={<IconTile Icon={MonitorIcon} size="lg" className="size-12 rounded-lg [&>svg]:size-6" />}
      eyebrow={isSearchView ? "Assign machines" : "Assigned machines"}
      title={flowName || "Agent"}
      footer={
        isSearchView ? (
          <>
            <StatusLine tone={selectedCount > 0 ? "pending" : "idle"}>
              {selectedCount > 0
                ? `${selectedCount} ${pluralize(selectedCount, "machine")} selected`
                : "Search for machines to assign"}
            </StatusLine>
            <div className="flex shrink-0 items-center gap-2">
              <CardDialogButton onClick={showMachines} disabled={search.isPending}>
                Back
              </CardDialogButton>
              <CardDialogButton
                variant="primary"
                onClick={search.handleSubmit}
                disabled={selectedCount === 0 || search.isPending}
                isBusy={search.isPending}
              >
                {search.isPending ? "Assigning" : "Assign"}
              </CardDialogButton>
            </div>
          </>
        ) : (
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <CardDialogButton onClick={handleClose}>Close</CardDialogButton>
            <CardDialogButton variant="primary" onClick={() => setView("Search")}>
              <PlusIcon className="size-4" />
              Assign machines
            </CardDialogButton>
          </div>
        )
      }
    >
      {isSearchView ? <AssignMachineSearch search={search} /> : <MachinesList />}
    </CardDialog>
  );
};

export default AssignMachinesDialog;
