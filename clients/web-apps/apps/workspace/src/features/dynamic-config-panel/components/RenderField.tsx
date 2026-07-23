import { InputField, SelectField, SwitchField } from "@avplatform/ui/form";

import { ConfigPanelAutosizeTextareaField, DCPFieldSchemaType } from "..";

// Helper to render the correct field type
export const RenderField = (field: DCPFieldSchemaType) => {
  // Create base props for the field
  const baseProps = {
    name: field.name,
    label: field.label,
    description: field.description,
    disabled: field.disabled,
    isRequired: field.required,
  };

  // Render the field based on its type
  switch (field.type) {
    case "number":
    case "email":
    case "file":
    case "color":
    case "time":
    case "password":
      return <InputField {...baseProps} type={field.type} fieldSize="base" />;
    case "text":
    case "textarea":
      return <ConfigPanelAutosizeTextareaField {...baseProps} minHeight={1} size="base" />;
    case "select":
      return <SelectField {...baseProps} selectOptions={field.selectOptions || []} />;
    case "switch":
      return (
        <SwitchField
          {...baseProps}
          label={field.label || ""}
          description={field.description || ""}
        />
      );
    default:
      return null;
  }
};
