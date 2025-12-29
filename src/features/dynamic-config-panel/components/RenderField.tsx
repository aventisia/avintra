import {
  InputField,
  MultiSelectField,
  SelectField,
  SwitchField,
} from "@aventisia/ui/form";
import {
  ConditionGroupsField,
  ConfigPanelAutosizeTextareaField,
  ConfigPanelOuputField,
  DCPFieldSchemaType,
} from "..";
import { ModelSelectField } from "./fields-for-form/ModelSelectField";
import { CredentialsSelectField } from "./fields-for-form/CredentialsSelectField";
import { ConfigPanelModelOutputField } from "./fields-for-form/ConfigPanelModelOutputField";
import { ModelConfigField } from "./fields-for-form/ModelConfigField";
import { SliderField } from "@/components/Slider/SliderField";
import { PromptConfigField } from "./fields-for-form/prompt-field/PromptField";

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
    case "credentials-select":
      return <CredentialsSelectField {...baseProps} />;
    case "config-panel-model-output":
      return <ConfigPanelModelOutputField {...baseProps} />;
    case "model-config-select":
      return <ModelConfigField name={field.name} />;
    case "prompt-input":
      return <PromptConfigField {...baseProps} rows={field.min ?? 5} />;
    case "multi-selector":
      return (
        <MultiSelectField
          {...baseProps}
          selectOptions={field.selectOptions || []}
        />
      );
    case "slider":
      return (
        <SliderField
          {...baseProps}
          defaultValue={field.defaultValue as number[]}
          min={field.min}
          max={field.max}
          step={0.1}
          className="resize-none text-sm"
        />
      );
    default:
      return null;
  }
};
