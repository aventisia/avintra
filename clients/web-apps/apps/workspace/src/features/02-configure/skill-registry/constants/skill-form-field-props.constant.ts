import { InputFieldProps, SwitchFieldProps, TextareaFieldProps } from "@avplatform/ui/form";

// Id
const idProps: InputFieldProps = {
  name: "id",
  label: "Id",
  disabled: true,
};

// Name
const nameProps: InputFieldProps = {
  autoFocus: true,
  name: "name",
  label: "Unique name",
  isRequired: true,
  placeholder: "pdf-report-generator",
  description:
    "A **unique** name for your skill.\n\n- **Format:** lowercase letters (a-z), numbers (0-9) and single hyphens (`-`) only, in kebab-case (e.g. `pdf-report-generator`).\n- **Max length:** 255 characters.\n- **Cannot be changed** after creation.",
};

// Description
const descriptionProps: TextareaFieldProps = {
  name: "description",
  label: "Description",
  description: "A short summary of what the skill does.",
  className: "min-h-[6rem]",
};

// Is Disabled
const isDisabledProps: SwitchFieldProps = {
  name: "isDisabled",
  label: "Disable record",
  description: "Disable this record if it's been outdated, or not required anymore",
};

export { idProps, descriptionProps, isDisabledProps, nameProps };
