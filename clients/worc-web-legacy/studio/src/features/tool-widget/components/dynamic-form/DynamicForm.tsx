import {
  DCPFieldSchemaType,
  shouldRenderField,
} from "@/features/dynamic-config-panel";

import { LoadingSpinner } from "@aventisia/ui";
import { Button, SubmitButton } from "@aventisia/ui/buttons";
import { Form } from "@aventisia/ui/form";
import { z } from "zod";

import { useDynamicForm } from "../../hooks/useDynamicForm";
import { RenderField } from "./RenderField";

const DynamicForm = ({
  config,
  onSubmit,
  onCancel,
  isPending,
  status = "",
}: {
  config: DCPFieldSchemaType[];
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  isPending?: boolean;
  status?: string;
}) => {
  const {
    form,
    inputKeys,
    isFormReady,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    configZodSchema,
    isLoading,
    watch,
  } = useDynamicForm({ config });

  // Watch all form values
  const watchedValues = watch();

  // Define submit handler
  const onSubmitHandle = (formData: z.infer<typeof configZodSchema>) => {
    onSubmit(formData);
    console.log(formData);
  };

  //If status present indicates executed
  const isReadOnly = !!status;

  if (!isFormReady) return <></>;

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmitHandle)}
      className="px-2.5 pb-5"
      disabled={isReadOnly}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 text-sm">
          <LoadingSpinner className="h-5 w-5 text-primary" />
        </div>
      ) : (
        <>
          {/* Input fields */}
          <div className="mt-1 space-y-3.5">
            {config.map((field) => {
              // Check if the field should be rendered based on direction and renderIf conditions
              if (!shouldRenderField("Input", field, watchedValues)) {
                //Remove the key from inputKeys if the field is not rendered
                if (inputKeys.includes(field.name))
                  inputKeys.splice(inputKeys.indexOf(field.name), 1);
                return null;
              }

              // Add the field name to inputKeys if not already present
              if (!inputKeys.includes(field.name)) inputKeys.push(field.name);

              // Render the field
              return <RenderField key={field.name} {...field} />;
            })}
          </div>
        </>
      )}
      {/* Submit button */}
      {!isReadOnly && (
        <div className="!mt-5 flex w-full gap-2 justify-end">
          <SubmitButton
            className="min-w-[5rem]"
            size={"sm"}
            primaryText={"Execute"}
            secondaryText="Executing..."
            isPending={!!isPending}
          />
          <Button
            type="button"
            variant={"outline"}
            size={"sm"}
            onClick={() => {
              onCancel();
            }}
          >
            {isPending ? "Stop" : "Cancel"}
          </Button>
        </div>
      )}
    </Form>
  );
};

export default DynamicForm;
