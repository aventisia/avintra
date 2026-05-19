import {
  AutosizeTextareaFieldProps,
  InputFieldProps,
} from "@aventisia/ui/form";
import { SelectFieldProps } from "@aventisia/ui/form";
import { enumToArray } from "@aventisia/ui/utils";

import { TemplateAccessTypesEnum } from "../enums/template-access-type-enum";

// Access Level
const accessLevelProps: SelectFieldProps = {
  name: "accessType",
  label: "Access Level",
  isRequired: true,
  selectOptions: enumToArray(TemplateAccessTypesEnum),
};

const templateNameProps: InputFieldProps = {
  name: "name",
  label: "Template Name",
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
