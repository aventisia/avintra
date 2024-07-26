import { FlowTypesEnum } from "@/react-toolkit/enums/flow-types-enum";
import { InputFieldProps } from "@/react-toolkit/form/components/fields/InputField";
import { SelectFieldProps } from "@/react-toolkit/form/components/fields/SelectField";
import { SwitchFieldProps } from "@/react-toolkit/form/components/fields/SwitchField";
import { TextareaFieldProps } from "@/react-toolkit/form/components/fields/TextareaField";
import { enumToArray } from "@/react-toolkit/utils/enum-to-array";


// Project Id
const projectIdProps: InputFieldProps = {
  name: "projectId",
  label: "Project Id",
  disabled: true,
};

// Flow Id
const idProps: InputFieldProps = {
  name: "id",
  label: "Flow Id",
  disabled: true,
};

// Type
const typeProps: SelectFieldProps = {
  name: "type",
  label: "Type",
  isRequired: true,
  selectOptions: enumToArray(FlowTypesEnum),
};

// Name
const nameProps: InputFieldProps = {
  name: "name",
  label: "Name",
  isRequired: true,
};

// Description
const descriptionProps: TextareaFieldProps = {
  name: "description",
  label: "Description",
  className: "min-h-[6rem]",
};

// Is Disabled
const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable Record",
  description:
    "Disable this record if it's been outdated, or not required anymore",
};

export { descriptionProps, idProps, isDisabledProps, nameProps, projectIdProps, typeProps };

