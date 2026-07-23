import { DatePickerFieldProps, MultiSelectFieldProps } from "@avplatform/ui/form";
import { enumToArray } from "@avplatform/ui/utils";

import { ServiceTypeEnum } from "@/features/06-super-admin/credit-plans-table/enums/service-type-enum";

const serviceTypeProps: MultiSelectFieldProps = {
  name: "serviceType",
  isRequired: false,
  className: "text-sm",
  label: "Service Type",
  selectOptions: enumToArray(ServiceTypeEnum),
  placeholder: "Select",
};

const usersProps: MultiSelectFieldProps = {
  name: "users",
  isRequired: true,
  label: "Users",
  className: "text-sm",
  selectOptions: [],
};

const agentsProps: MultiSelectFieldProps = {
  name: "agents",
  label: "Agents",
  isRequired: true,
  className: "text-sm",
  selectOptions: [],
};

const startDateProps: DatePickerFieldProps = {
  name: "startDate",
  label: "Start Date",
  // isRequired: true,
  placeholder: "DD/MM/YYYY",
};

const endDateProps: DatePickerFieldProps = {
  name: "endDate",
  label: "End Date",
  // isRequired: true,
  placeholder: "DD/MM/YYYY",
};

export { serviceTypeProps, usersProps, agentsProps, startDateProps, endDateProps };
