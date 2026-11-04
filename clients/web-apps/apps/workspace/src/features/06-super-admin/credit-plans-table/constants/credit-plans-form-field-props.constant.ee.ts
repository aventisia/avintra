import { InputFieldProps, SelectFieldProps, SwitchFieldProps } from "@avplatform/ui/form";
import { enumToArray } from "@avplatform/ui/utils";

import { ServiceTypeEnum } from "../enums/service-type-enum.ee";
import { UnitTypeEnum } from "../enums/unit-type-enum.ee";

const serviceTypeProps: SelectFieldProps = {
  name: "serviceType",
  label: "Service type",
  isRequired: true,
  description: "The type of service the plan covers.",
  selectOptions: enumToArray(ServiceTypeEnum),
  placeholder: "e.g. GPT 5.1-input",
};

const unitTypeProps: SelectFieldProps = {
  name: "unitType",
  label: "Unit type",
  isRequired: true,
  description: "The unit type used to measure consumption.",
  selectOptions: enumToArray(UnitTypeEnum),
  placeholder: "e.g. Tokens",
};

const oneUnitProps = {
  name: "oneUnit",
  label: "One unit",
  description: "Quantity of the unit type priced together.",
} as const satisfies InputFieldProps;

const creditsProps = {
  name: "credits",
  label: "Credits",
  description: "Credits charged for that quantity.",
} as const satisfies InputFieldProps;

const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable plan",
  description: "Disable this plan when it is outdated or no longer used.",
};

export { serviceTypeProps, unitTypeProps, oneUnitProps, creditsProps, isDisabledProps };
