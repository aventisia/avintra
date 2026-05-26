import { ServiceTypeEnum } from "@/features/06-super-admin/credit-plans-table/enums/service-type-enum";

import { Button } from "@aventisia/ui/buttons";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aventisia/ui/select";
import { enumToArray } from "@aventisia/ui/utils";
import { Download } from "lucide-react";

import { useExportDialogStore } from "../store/export-dialog-store";
import { AvailableCredits } from "./AvailableCredits";
import ChartsHeaderDateRangeFilter from "./ChartsHeaderDateRangeFilter";

const ChartsHeader = () => {
  const { setOpen } = useExportDialogStore();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <p className="text-lg font-medium">Usage</p>
        <AvailableCredits />
      </div>

      <div className="flex items-center gap-4">
        {/* Select Services */}
        {/* To be removed/replaced later */}
        <Select>
          <SelectTrigger className="hidden w-[180px]">
            <SelectValue placeholder="All Service" />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              {enumToArray(ServiceTypeEnum).map((item) => {
                return <SelectItem value={item.value}>{item.label}</SelectItem>;
              })}
            </SelectGroup>
          </SelectContent>
        </Select>

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
