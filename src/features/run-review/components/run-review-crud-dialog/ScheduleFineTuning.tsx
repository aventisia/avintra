import { AsyncSelectField } from "@/react-toolkit/ui/form/fields/AsyncSelectField";
import { DateTimePickerField } from "@/shared/date-time-picker/DateTimePickerField";

import { timeZoneProps } from "../../constants/add-records-field-props";

const ScheduleFineTuning = () => {
  return (
    <>
      <AsyncSelectField {...timeZoneProps} />
      <DateTimePickerField
        name="scheduleInfo.scheduledAt"
        label="Schedule on"
        placeholder="Pick a date & time"
      />
    </>
  );
};

export default ScheduleFineTuning;
