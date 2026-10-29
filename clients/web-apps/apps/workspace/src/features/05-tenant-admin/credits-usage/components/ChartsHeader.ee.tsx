import { Button } from "@avplatform/ui/buttons";
import { Download } from "lucide-react";

import { HelpButton } from "@/components/help/HelpButton";

import { useExportDialogStore } from "../store/export-dialog-store.ee";
import { AvailableCredits } from "./AvailableCredits.ee";
import ChartsHeaderDateRangeFilter from "./ChartsHeaderDateRangeFilter.ee";
import { SpaceFilterSelect } from "./SpaceFilterSelect.ee";

const ChartsHeader = () => {
  const { setOpen } = useExportDialogStore();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <p className="text-lg font-medium">Usage</p>
          <HelpButton guideId="usage" />
        </div>
        <AvailableCredits />
      </div>

      <div className="flex items-center gap-4">
        {/* Space Filter */}
        <SpaceFilterSelect />

        {/* Calendar */}
        <ChartsHeaderDateRangeFilter />

        {/* Export Button */}
        <Button
          variant={"outline"}
          className="border-primary text-sm text-primary"
          onClick={() => setOpen(true)}
        >
          Export
          <span className="ml-2">
            <Download className="h-4 w-4" />
          </span>
        </Button>
      </div>
    </div>
  );
};

export default ChartsHeader;
