import { InputField, MultiSelectField, SelectField, SwitchField } from "@avplatform/ui/form";
import { cn } from "@avplatform/ui/lib";

import { SliderField } from "@/components/Slider/SliderField";
import { CodeEditorField } from "@/components/code-editor/CodeEditorField";
import { JsonEditorField } from "@/components/json-editor/JsonEditorField";
import { VOICE_AGENT_NODE_NAME } from "@/features/react-flow/utils/voice-agent-graph.util";

import {
  ConditionGroupsField,
  ConfigPanelAutosizeTextareaField,
  ConfigPanelOuputField,
  DCPFieldSchemaType,
} from "..";
import { useDynamicConfigPanelStore } from "../stores/dcp-store";
import { ConfigPanelModelOutputField } from "./fields-for-form/ConfigPanelModelOutputField";
import { KnowledgeBaseConfigField } from "./fields-for-form/KnowledgeBaseConfigField";
import { MemoryConfigField } from "./fields-for-form/MemoryConfigField";
import { ModelConfigField } from "./fields-for-form/ModelConfigField";
import { QueueSelectorField } from "./fields-for-form/QueueSelectorField";
import { SkillsConfigField } from "./fields-for-form/SkillsConfigField";
import { StatusSelectorField } from "./fields-for-form/StatusSelectorField";
import { StringArrayField } from "./fields-for-form/StringArrayField";
import { SuggestionsField } from "./fields-for-form/SuggestionsField";
import { ToolsConfigField } from "./fields-for-form/ToolsConfigField";
import { VaultCredentialSelectField } from "./fields-for-form/VaultCredentialSelectField";
import { VoiceFeaturesTab } from "./fields-for-form/VoiceFeaturesTab";
import { VoicePronunciationTab } from "./fields-for-form/VoicePronunciationTab";
import { PromptConfigFieldV2 } from "./fields-for-form/prompt-field/PromptConfigFieldV2";
import { PromptConfigField } from "./fields-for-form/prompt-field/PromptField";
import { QueueConditionGroupsField } from "./queue-condition-groups/QueueConditionGroupsField";
import { QueuePriorityGroupsField } from "./queue-condition-groups/QueuePriorityGroupsField";

const isVoiceFeaturesField = (field: DCPFieldSchemaType): boolean =>
  field.category === "Features" &&
  /^__\w+__Voice$/.test(field.name) &&
  useDynamicConfigPanelStore.getState().nodeData?.name === VOICE_AGENT_NODE_NAME;

const isVoicePronunciationField = (field: DCPFieldSchemaType): boolean =>
  field.category === "Pronunciation" &&
  /^__\w+__Voice$/.test(field.name) &&
  useDynamicConfigPanelStore.getState().nodeData?.name === VOICE_AGENT_NODE_NAME;

// Helper to render the correct field type
export const RenderField = ({ force, ...field }: DCPFieldSchemaType & { force?: boolean }) => {
  if (!force && isVoicePronunciationField(field)) {
    return field.name === "__PronunciationEnabled__Voice" ? <VoicePronunciationTab /> : null;
  }

  // IMPORTANT NOTE: sibling Features fields return null here; the untouched DCPForm loop and
  // useDefineDCPForm derivation still own the 18-key inputKeys retention.
  if (!force && isVoiceFeaturesField(field)) {
    return field.name === "__VariablesEnabled__Voice" ? <VoiceFeaturesTab /> : null;
  }

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
      return <VaultCredentialSelectField {...baseProps} />;
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
      return (
        <ToolsConfigField
          name={field.name}
          lockApprovalToAuto={
            useDynamicConfigPanelStore.getState().nodeData?.name === VOICE_AGENT_NODE_NAME
          }
        />
      );
    case "voice-config-select":
      // IMPORTANT NOTE: this schema entry stays load-bearing for form defaults and Zod
      // generation; its UI renders inline inside ModelConfigField for TTS-capable nodes.
      return null;
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
