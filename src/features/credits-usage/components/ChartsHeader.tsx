import { Badge } from "@aventisia/ui/badge";
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
import { format } from "date-fns";

import { ServiceTypeEnum } from "@/features/sa/credit-plans-table/enums/service-type-enum";

import { DateRangePicker } from "../shared/date-range-picker/DateRangePicker";
import { useExportDialogStore } from "../store/export-dialog-store";
import { useDateRangePickerStore } from "../store/date-range-store";
// import { useFetchCreditUsageSummary } from "../hooks/useFetchCreditUsageSummary";

const ChartsHeader = () => {
  const { setOpen } = useExportDialogStore();
  const { setStartEndDate } = useDateRangePickerStore();
  // const { refetch } = useFetchCreditUsageSummary();

  const avaialbleCredits = 20000;
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <p className="text-lg font-medium">Credit Usage</p>
        <Badge className="border border-black bg-transparent px-4 py-1 text-sm text-accent-foreground">
          Available Credits: {avaialbleCredits.toLocaleString()}
        </Badge>
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
        <DateRangePicker
          onUpdate={(values) => {
            const from = format(values.range.from, "yyyy-MM-dd");
            const to = format(
              values.range.to ?? values.range.from,
              "yyyy-MM-dd",
            );

            setStartEndDate(from, to);
          }}
          initialDateFrom={format(new Date(), "yyyy-MM-dd")}
          initialDateTo={format(new Date(), "yyyy-MM-dd")}
          align="start"
          locale="en-GB"
          showCompare={false}
        />

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
