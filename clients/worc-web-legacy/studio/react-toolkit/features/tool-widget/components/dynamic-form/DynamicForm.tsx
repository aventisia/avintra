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
  submitText = "Submit",
  submittingText = "Submitting...",
}: {
  config: DCPFieldSchemaType[];
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  isPending?: boolean;
  status?: string;
  submitText?: string;
  submittingText?: string;
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

  const watchedValues = watch();

  const onSubmitHandle = (formData: z.infer<typeof configZodSchema>) => {
    onSubmit(formData);
    console.log(formData);
  };

  const isReadOnly = !!status;

  if (!isFormReady) return <></>;

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmitHandle)}
      className="px-2.5 pb-2.5"
      disabled={isReadOnly}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 text-sm">
          <LoadingSpinner className="h-5 w-5 text-primary" />
        </div>
      ) : (
        <>
          <div className="mt-1 space-y-3.5">
            {config.map((field) => {
              if (!shouldRenderField("Input", field, watchedValues)) {
                if (inputKeys.includes(field.name))
                  inputKeys.splice(inputKeys.indexOf(field.name), 1);
                return null;
              }

              if (!inputKeys.includes(field.name)) inputKeys.push(field.name);

              return <RenderField key={field.name} {...field} />;
            })}
          </div>
        </>
      )}
      {!isReadOnly && (
        <div className="!mt-4 flex w-full gap-2 justify-end">
          <SubmitButton
            className="min-w-[5rem]"
            size={"sm"}
            primaryText={submitText}
            secondaryText={submittingText}
            isPending={!!isPending}
          />
          {!isPending && (
            <Button
              type="button"
              variant={"outline"}
              size={"sm"}
              onClick={() => {
                onCancel();
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      )}
    </Form>
  );
};

export default DynamicForm;
