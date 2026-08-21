import { InputFieldProps, SelectFieldProps, SwitchFieldProps } from "@avplatform/ui/form";
import { enumToArray } from "@avplatform/ui/utils";

import { ServiceTypeEnum } from "../enums/service-type-enum";
import { UnitTypeEnum } from "../enums/unit-type-enum";

// Credit Plan Id
const idProps: InputFieldProps = {
  name: "id",
  label: "Plan Id",
  disabled: true,
};

// Service Type
const serviceTypeProps: SelectFieldProps = {
  name: "serviceType",
  label: "Service Type",
  isRequired: true,
  description: "The type of service the plan covers.",
  selectOptions: enumToArray(ServiceTypeEnum),
  placeholder: "Select",
};

// Unit Type
const unitTypeProps: SelectFieldProps = {
  name: "unitType",
  label: "Unit Type",
  isRequired: true,
  description: "The unit type used to measure consumption.",
  selectOptions: enumToArray(UnitTypeEnum),
  placeholder: "Select",
};

// Is Disabled
const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Record",
  description: "Disable this record if it's been outdated, or not required anymore",
};

export { idProps, serviceTypeProps, unitTypeProps, isDisabledProps };
