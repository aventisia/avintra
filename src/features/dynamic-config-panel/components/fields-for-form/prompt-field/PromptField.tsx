import { useEffect, useState } from "react";
import { TextareaField } from "@aventisia/ui/form";
import { useController, useFormContext } from "react-hook-form";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@aventisia/ui/dropdown-menu";
import { Button } from "@aventisia/ui/buttons";

import { promptTemplatesList } from "./prompt-templates-list";
import { useFetchPromptTemplate } from "./useFetchPromptTemplate";

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
  const { control, setValue } = useFormContext();
  const { field: promptField } = useController({ name, control });
  const { showCustomAlertDialog } = useShowAlertHandler();

  const [selectedTemplate, setSelectedTemplate] = useState<string>();

  const { data: templateContent } = useFetchPromptTemplate(selectedTemplate);

  useEffect(() => {
    if (!templateContent) return;

    const applyTemplate = () => {
      promptField.onChange(templateContent);
      setValue("json_schema", "");
    };

    if (promptField.value) {
      showCustomAlertDialog({
        title: "Use Prompt Template",
        description: "This will replace the existing prompt content.",
        confirmBtnText: "Continue",
        isDestructive: false,
        confirmActionFn: applyTemplate,
      });
    } else {
      applyTemplate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateContent]);

  const handleOptionChange = (fileKey: string) => {
    setSelectedTemplate(fileKey);
  };

  return (
    <div className="w-full space-y-3.5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <Button variant="outline" size="sm" className="w-full">
            Select a prompt template
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="p-1"
          align="start"
          style={{ minWidth: "var(--radix-dropdown-menu-trigger-width)" }}
        >
          <DropdownMenuGroup>
            {promptTemplatesList
              .filter((item) => item.id == name)
              .map((item) => (
                <DropdownMenuItem
                  key={item.label}
                  onClick={() => handleOptionChange(item.value)}
                  className="cursor-pointer flex-col items-start gap-1 border-b last:border-b-0"
                >
                  <h2 className="text-sm">{item.label}</h2>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </DropdownMenuItem>
              ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <TextareaField
        autoFocus
        placeholder="Enter the prompt..."
        name={name}
        rows={rows}
      />
    </div>
  );
};

PromptConfigField.displayName = "PromptConfigField";

export { PromptConfigField };
