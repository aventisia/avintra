import {
  AutosizeTextareaFieldProps,
  InputFieldProps,
  MultiSelectFieldProps,
} from "@avplatform/ui/form";
import { SelectFieldProps } from "@avplatform/ui/form";
import { enumToArray } from "@avplatform/ui/utils";

import { AccessTypeEnum } from "./access-type-enums ";
import { SaveAsEnum } from "./save-as-enums";

// Save As
const saveAsProps: SelectFieldProps = {
  name: "saveAs",
  label: "Save as",
  isRequired: true,
  selectOptions: enumToArray(SaveAsEnum),
};

// Access Level
const accessLevelProps: SelectFieldProps = {
  name: "accessType",
  label: "Access level",
  isRequired: true,
  selectOptions: enumToArray(AccessTypeEnum),
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

// Access Type
const spacesProps: MultiSelectFieldProps = {
  name: "spaces",
  label: "Spaces",
  isRequired: true,
  selectOptions: [
    { label: "Space 1", value: "space1" },
    { label: "Space 2", value: "space2" },
  ],
};

export { saveAsProps, accessLevelProps, spacesProps, templateNameProps, descriptionProps };
