import { InputField, MultiSelectField, SelectField, SwitchField } from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";

import { SliderField } from "@/components/Slider/SliderField";
import { CodeEditorField } from "@/components/code-editor/CodeEditorField";
import { JsonEditorField } from "@/components/json-editor/JsonEditorField";

import {
  ConditionGroupsField,
  ConfigPanelAutosizeTextareaField,
  ConfigPanelOuputField,
  DCPFieldSchemaType,
} from "..";
import { ConfigPanelModelOutputField } from "./fields-for-form/ConfigPanelModelOutputField";
import { CredentialsSelectField } from "./fields-for-form/CredentialsSelectField";
import { KnowledgeBaseConfigField } from "./fields-for-form/KnowledgeBaseConfigField";
import { MemoryConfigField } from "./fields-for-form/MemoryConfigField";
import { ModelConfigField } from "./fields-for-form/ModelConfigField";
import { QueueSelectorField } from "./fields-for-form/QueueSelectorField";
import { SkillsConfigField } from "./fields-for-form/SkillsConfigField";
import { StatusSelectorField } from "./fields-for-form/StatusSelectorField";
import { StringArrayField } from "./fields-for-form/StringArrayField";
import { SuggestionsField } from "./fields-for-form/SuggestionsField";
import { ToolsConfigField } from "./fields-for-form/ToolsConfigField";
import { VoiceConfigField } from "./fields-for-form/VoiceConfigField";
import { PromptConfigFieldV2 } from "./fields-for-form/prompt-field/PromptConfigFieldV2";
import { PromptConfigField } from "./fields-for-form/prompt-field/PromptField";
import { QueueConditionGroupsField } from "./queue-condition-groups/QueueConditionGroupsField";
import { QueuePriorityGroupsField } from "./queue-condition-groups/QueuePriorityGroupsField";

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
    case "condition-groups":
      return <ConditionGroupsField {...field} />;
    case "config-panel-output":
      return <ConfigPanelOuputField {...baseProps} />;
    case "credentials-select":
      return <CredentialsSelectField {...baseProps} />;
    case "config-panel-model-output":
      return <ConfigPanelModelOutputField {...baseProps} />;
    case "model-config-select":
      return (
        <ModelConfigField
          name={field.name}
          showJsonOutput={field.showJsonOutput}
          specialty={field.specialty}
          hideByok={field.hideByok}
        />
      );
    case "tools-config-select":
      return <ToolsConfigField name={field.name} />;
    case "voice-config-select":
      return <VoiceConfigField name={field.name} providerPath={field.providerPath} />;
    case "prompt-input":
      return <PromptConfigField {...baseProps} rows={field.min ?? 5} />;
    case "prompt-input-v2":
      return (
        <PromptConfigFieldV2
          {...baseProps}
          showTokenCount={field.showTokenCount}
          showVariables={field.showVariables}
        />
      );
    case "multi-selector":
      return <MultiSelectField {...baseProps} selectOptions={field.selectOptions || []} />;
    case "slider":
      return (
        <SliderField
          {...baseProps}
          min={field.min}
          max={field.max}
          step={0.1}
          className="resize-none text-sm"
        />
      );
    case "knowledge-base-config":
      return <KnowledgeBaseConfigField name={field.name} />;
    case "skills-config":
      return <SkillsConfigField name={field.name} />;

    case "memory-config":
      return <MemoryConfigField name={field.name} />;
    case "json-editor":
      return <JsonEditorField {...baseProps} className={field.className} />;
    case "queue-select":
      return <QueueSelectorField {...baseProps} selectOptions={[]} size="sm" />;
    case "queue-status-select":
      return <StatusSelectorField {...baseProps} size="sm" />;
    case "queue-conditional-group":
      return <QueueConditionGroupsField {...field} />;
    case "queue-priority-group":
      return <QueuePriorityGroupsField {...field} />;
    case "string-array":
      return <StringArrayField {...field} size="sm" />;
    case "suggestions":
      return <SuggestionsField {...field} size="sm" />;
    case "code-editor":
      return <CodeEditorField {...field} className={cn("dcp-code-editor", field.className)} />;
    default:
      return null;
  }
};
