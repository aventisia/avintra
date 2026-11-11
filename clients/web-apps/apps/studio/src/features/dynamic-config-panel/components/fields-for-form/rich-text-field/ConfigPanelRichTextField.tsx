import {
  BaseFieldProps,
  FormField,
  FormItem,
  FormLabelExt,
  FormMessage,
} from "@avplatform/ui/form";
import { Toggle } from "@avplatform/ui/toggle";
import { Tooltip } from "@avplatform/ui/tooltip";
import * as React from "react";
import { FieldPath, FieldValues, useFormContext, useWatch } from "react-hook-form";

import { RenderIfType } from "../../../types/render-if-type";
import { survivesVisualEditing } from "../../../utils/rich-text-value.util";
import { meetsRenderIfConditions } from "../../../utils/should-render-field";
import { ConfigPanelAutosizeTextareaField } from "../ConfigPanelAutosizeTextareaField";
import { RichTextEditor } from "./RichTextEditor";

type ConfigPanelRichTextFieldProps = BaseFieldProps & {
  /** The name of the form field. */
  name: FieldPath<FieldValues>;
  disabled?: boolean;
  /** Conditions on sibling fields (such as an HTML format switch) under which the body is HTML. */
  richTextIf?: RenderIfType;
};

type EditorMode = "visual" | "markup";

const asString = (value: unknown) => (typeof value === "string" ? value : "");

/**
 * HTML body field with a visual rich text editor and a raw markup view of the same value; a plain
 * textarea when `richTextIf` is unmet.
 */
const ConfigPanelRichTextField = ({
  name,
  label,
  isRequired,
  description,
  disabled,
  richTextIf,
}: ConfigPanelRichTextFieldProps) => {
  const { control, getValues } = useFormContext<FieldValues>();
  const formValues: Record<string, unknown> = useWatch({ control });
  const [mode, setMode] = React.useState<EditorMode>(() =>
    survivesVisualEditing(asString(getValues(name))) ? "visual" : "markup",
  );
  const switchToMarkup = React.useCallback(() => setMode("markup"), []);
  const canEditVisually = React.useMemo(
    () => mode === "visual" || survivesVisualEditing(asString(formValues[name])),
    [mode, formValues, name],
  );

  if (richTextIf && !meetsRenderIfConditions(richTextIf, formValues)) {
    return (
      <ConfigPanelAutosizeTextareaField
        {...{ name, label, isRequired, description, disabled }}
        minHeight={0}
      />
    );
  }

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center gap-2">
            {label && <FormLabelExt {...{ label, disabled, isRequired, description }} />}
            <div className="flex items-center rounded-md border border-input p-px">
              {(["visual", "markup"] as const).map((option) => {
                const toggle = (
                  <Toggle
                    key={option}
                    size="sm"
                    className="h-5 min-w-0 px-1.5 text-xs capitalize"
                    pressed={mode === option}
                    disabled={option === "visual" && !canEditVisually}
                    onPressedChange={() => setMode(option)}
                  >
                    {option}
                  </Toggle>
                );
                return option === "visual" && !canEditVisually ? (
                  <Tooltip
                    key={option}
                    content="This markup uses formatting the visual editor would drop"
                  >
                    <span>{toggle}</span>
                  </Tooltip>
                ) : (
                  toggle
                );
              })}
            </div>
          </div>
          {mode === "visual" ? (
            <>
              <RichTextEditor
                field={field}
                label={label}
                disabled={disabled}
                onUnsupportedValue={switchToMarkup}
              />
              <FormMessage />
            </>
          ) : (
            <ConfigPanelAutosizeTextareaField name={name} disabled={disabled} minHeight={0} />
          )}
        </FormItem>
      )}
    />
  );
};

export { ConfigPanelRichTextField, type ConfigPanelRichTextFieldProps };
