import { InputField, SelectField, SwitchField } from "@avplatform/ui/form";

import { DCPFieldSchemaType } from "@/features/dynamic-config-panel";

import { ConfigPanelAutosizeTextareaField } from "./ConfigPanelAutosizeTextareaField";

// Helper to render the correct field type
export const RenderField = (field: DCPFieldSchemaType) => {
  // Create base props for the field
  const baseProps = {
    name: field.name,
    label: field.label,
    description: field.description,
    disabled: field.disabled,
  };

  // Render the field based on its type
  switch (field.type) {
    case "number":
    case "email":
    case "file":
    case "color":
    case "time":
    case "password":
      return <InputField {...baseProps} type={field.type} fieldSize="sm" />;
    case "text":
    case "textarea":
      return (
        <ConfigPanelAutosizeTextareaField
          {...baseProps}
          size="sm"
          minHeight={32} // h-8
        />
      );

    case "select":
      return (
        <SelectField
          {...baseProps}
          matchPopoverWidth={true}
          selectOptions={field.selectOptions || []}
          size="sm"
        />
      );
    case "switch":
      return (
        <SwitchField
          {...baseProps}
          label={field.label || ""}
          description={field.description || ""}
          size="sm"
        />
      );
    default:
      return null;
  }
};
