import { InputField, SelectField, SwitchField } from "@aventisia/ui/form";
import {
  ConditionGroupsField,
  ConfigPanelAutosizeTextareaField,
  ConfigPanelOuputField,
  DCPFieldSchemaType,
} from "..";
import { ModelSelectField } from "./fields-for-form/ModelSelectField";
import { ConfigPanelModelOutputField } from "./fields-for-form/ConfigPanelModelOutputField";

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
      return <ConfigPanelAutosizeTextareaField {...baseProps} minHeight={0} />;
    case "select":
      return (
        <SelectField
          {...baseProps}
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
    case "condition-groups":
      return <ConditionGroupsField {...field} />;
    case "config-panel-output":
      return <ConfigPanelOuputField {...baseProps} />;
    case "model-select":
      return <ModelSelectField {...baseProps} />;
    case "config-panel-model-output":
      return <ConfigPanelModelOutputField {...baseProps} />;
    default:
      return null;
  }
};
