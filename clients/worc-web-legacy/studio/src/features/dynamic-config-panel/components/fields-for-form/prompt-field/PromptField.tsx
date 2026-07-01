import { Button } from "@aventisia/ui/buttons";
import { TextareaField } from "@aventisia/ui/form";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { Tooltip } from "@aventisia/ui/tooltip";
import { BookCopyIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";

import { PromptSelect } from "@/features/dynamic-config-panel/components/fields-for-form/prompt-field/prompt-seletor";
import { SaveAsTemplateDialog } from "@/features/save-prompt-template/components/SaveAsTemplateDialog";
import { useFetchTemplateList } from "@/features/save-prompt-template/hooks/useFetchTemplateList";
import { useSavePromptTemplateStore } from "@/features/save-prompt-template/stores/save-prompt-template-store";
import { PromptTemplateSchema } from "@/features/save-prompt-template/types/prompt-template-schema-type";

interface PromptConfigFieldProps {
  name: string;
  rows: number;
  disabled?: boolean;
}

const PromptConfigField = ({
  name,
  rows,
  disabled,
}: PromptConfigFieldProps) => {
  const { control, setValue, getValues } = useFormContext();

  const { field: promptField } = useController({
    name,
    control,
  });

  const { showCustomAlertDialog } = useShowAlertHandler();

  const [selectedTemplate, setSelectedTemplate] = useState<string>();

  const { data: templatesData } = useFetchTemplateList();

  const templateOptions = useMemo(() => {
    return (
      templatesData?.data?.map((template) => {
        return {
          label: template.name,
          value: template.id ?? "",
          description: template.description ?? "",
        };
      }) ?? []
    );
  }, [templatesData]);

  const applyTemplate = (schema: PromptTemplateSchema) => {
    const formValues = getValues();

    const promptKey = Object.keys(formValues).find((key) =>
      key.startsWith("__Prompt__"),
    );

    const modelConfigKey = Object.keys(formValues).find((key) =>
      key.startsWith("__ModelConfig__"),
    );

    const toolsConfigKey = Object.keys(formValues).find((key) =>
      key.startsWith("__ToolsConfig__"),
    );

    if (promptKey && schema.prompt !== undefined) {
      setValue(promptKey, schema.prompt, {
        shouldDirty: true,
      });
    }

    if (modelConfigKey && schema.modelConfig) {
      setValue(
        modelConfigKey,
        {
          ...formValues[modelConfigKey],
          ...schema.modelConfig,
          is_json_output:
            name === "__Prompt__Conversation"
              ? false
              : schema.modelConfig.is_json_output,
        },
        {
          shouldDirty: true,
        },
      );
    }

    if (toolsConfigKey) {
      setValue(toolsConfigKey, schema.toolsConfig ?? "", {
        shouldDirty: true,
      });
    }

    setValue("json_schema", "");
  };

  const handleOptionChange = (templateId: string) => {
    const selectedTemplateData = templatesData?.data?.find(
      (template) => template.id === templateId,
    );

    if (!selectedTemplateData?.schema) return;

    let parsedSchema: PromptTemplateSchema;

    try {
      parsedSchema = JSON.parse(
        selectedTemplateData.schema,
      ) as PromptTemplateSchema;
    } catch {
      return;
    }

    const executeApply = () => {
      applyTemplate(parsedSchema);

      // update selector only after successful apply
      setSelectedTemplate(templateId);
    };

    if (promptField.value) {
      showCustomAlertDialog({
        title: "Use Prompt Template",
        description:
          "This will replace the existing prompt content and model configurations.",
        confirmBtnText: "Continue",
        isDestructive: false,
        confirmActionFn: executeApply,
      });

      return;
    }

    executeApply();
  };
  const { setShowDialog, setFormData, setTemplateId } =
    useSavePromptTemplateStore(
      useShallow((state) => ({
        setShowDialog: state.setShowDialog,
        setFormData: state.setFormData,
        setTemplateId: state.setTemplateId,
      })),
    );

  return (
    <div className="w-full">
      <div className="flex items-center justify-end gap-2 rounded-lg rounded-b-none border border-b-0 p-2">
        <PromptSelect
          options={templateOptions}
          value={selectedTemplate}
          disabled={disabled}
          placeholder="Select a prompt"
          size="sm"
          className="max-w-md"
          onValueChange={handleOptionChange}
        />

        <Tooltip content="Save Prompt Template">
          <Button
            type="button"
            variant="outline"
            size="xs"
            className="min-w-5"
            onClick={() => {
              setShowDialog(true);
              setFormData(getValues());
              setTemplateId(selectedTemplate || "");
            }}
          >
            <BookCopyIcon className="mr-1 size-3.5" />
            Save
          </Button>
        </Tooltip>
      </div>

      <TextareaField
        className="rounded-t-none"
        autoFocus
        placeholder="Enter the prompt..."
        name={name}
        rows={rows}
      />

      <SaveAsTemplateDialog />
    </div>
  );
};

PromptConfigField.displayName = "PromptConfigField";

export { PromptConfigField };
