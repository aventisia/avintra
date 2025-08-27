import { AsyncSelectFieldProps } from "@/react-toolkit/ui/form/fields/AsyncSelectField";
import { getSearchOptionsForAsyncSelect } from "@/react-toolkit/utils";

import { ISelectOption } from "@aventisia/ui/types";
import Enumerable from "linq";
import timezones from "timezones-list";

const timeZoneProps: AsyncSelectFieldProps = {
  name: "timeZone",
  label: "Time zone",
  size: "base",
  getOptionValue: (option) => option.value.toLowerCase(),
  selectOptions: (search) =>
    getSearchOptionsForAsyncSelect(
      Enumerable.from(timezones)
        .select<ISelectOption>((t) => ({
          value: t.tzCode,
          label: t.label,
        }))
        .toArray(),
      search,
    ),
  triggerClassName: "w-full",
  className: "w-fit ",
};

export { timeZoneProps };
