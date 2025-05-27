import { ConfigPanelOuputField } from "@/features/dynamic-config-panel/components/ConfigPanelOuputField";
import { InputField } from "@aventisia/ui/form";
import { SelectField } from "@aventisia/ui/form";
import { SwitchField } from "@aventisia/ui/form";
import { TextareaField } from "@aventisia/ui/form";
import { DCPFieldSchemaType } from "..";

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
    case "text":
    case "number":
    case "email":
    case "file":
    case "color":
    case "time":
    case "password":
      return (
        <InputField key={name} {...baseProps} type={type} fieldSize="sm" />
      );
    case "textarea":
      return <TextareaField key={name} {...baseProps} />;
    case "select":
      return (
        <SelectField
          key={name}
          {...baseProps}
          selectOptions={selectOptions || []}
        />
      );
    case "switch":
      return (
        <SwitchField
          size="sm"
          key={name}
          {...baseProps}
          description={description || ""}
        />
      );
    case "config-panel-output":
      return (
        <ConfigPanelOuputField
          key={name}
          {...baseProps}
          description={description}
        />
      );
    default:
      return null;
  }
};
