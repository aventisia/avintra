import { AutosizeTextareaFieldProps, InputFieldProps } from "@avplatform/ui/form";
import { SelectFieldProps } from "@avplatform/ui/form";
import { enumToArray } from "@avplatform/ui/utils";

import { TemplateAccessTypesEnum } from "../enums/template-access-type-enum";

// Access Level
const accessLevelProps: SelectFieldProps = {
  name: "accessType",
  label: "Access level",
  isRequired: true,
  selectOptions: enumToArray(TemplateAccessTypesEnum),
};

const templateNameProps: InputFieldProps = {
  name: "name",
  label: "Template name",
  className: "text-sm",
  isRequired: true,
};

const descriptionProps: AutosizeTextareaFieldProps = {
  name: "description",
  label: "Description",
  minHeight: 10,
  className: "text-sm",
};

export { accessLevelProps, templateNameProps, descriptionProps };
