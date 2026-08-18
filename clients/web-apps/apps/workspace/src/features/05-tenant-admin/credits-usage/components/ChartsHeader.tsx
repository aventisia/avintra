import { Button } from "@avplatform/ui/buttons";
import { Download } from "lucide-react";

import { useExportDialogStore } from "../store/export-dialog-store";
import { AvailableCredits } from "./AvailableCredits";
import ChartsHeaderDateRangeFilter from "./ChartsHeaderDateRangeFilter";
import { SpaceFilterSelect } from "./SpaceFilterSelect";

const ChartsHeader = () => {
  const { setOpen } = useExportDialogStore();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <p className="text-lg font-medium">Usage</p>
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
