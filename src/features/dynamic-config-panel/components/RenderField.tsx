import { ConfigPanelOuputField } from "@/features/dynamic-config-panel/components/ConfigPanelOuputField";
import { InputField, SelectField, SwitchField } from "@aventisia/ui/form";
import { DCPFieldSchemaType } from "..";
import { ConfigPanelAutosizeTextareaField } from "./ConfigPanelAutosizeTextareaField";

// Helper to render the correct field type
export const RenderField = ({
  type,
  name,
  label,
  selectOptions,
  description,
}: DCPFieldSchemaType) => {
  // Create base props for the field
  const baseProps = {
    name,
    label,
    description,
  };

  // Render the field based on its type
  switch (type) {
    case "number":
    case "email":
    case "file":
    case "color":
    case "time":
    case "password":
      return <InputField {...baseProps} type={type} fieldSize="sm" />;
    case "text":
    case "textarea":
      return <ConfigPanelAutosizeTextareaField {...baseProps} minHeight={0} />;
    case "select":
      return (
        <SelectField
          {...baseProps}
          selectOptions={selectOptions || []}
          size="sm"
        />
      );
    case "switch":
      return (
        <SwitchField {...baseProps} description={description || ""} size="sm" />
      );
    case "config-panel-output":
      return <ConfigPanelOuputField {...baseProps} description={description} />;
    default:
      return null;
  }
};
