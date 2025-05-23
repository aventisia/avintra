import { Button } from "@/react-toolkit/ui/buttons/Button";
import { Form } from "@/react-toolkit/ui/form/Form";
import { NodeInputType, NodeOutputType } from "@/types/node-data-type";
import { z } from "zod";
import {
  RenderField,
  useDefineDCPForm,
  useUpdateNodeDataIO,
  shouldRenderField,
} from "..";
import { toast } from "sonner";

export const DCPForm = () => {
  // Define form
  const {
    form,
    watch,
    nodeConfig,
    isFormReady,
    nodeConfigZodSchema,
    nodeId,
    inputKeys,
    outputKeys,
    setShowDialog,
  } = useDefineDCPForm();

  // Watch all form values
  const watchedValues = watch();

  // Get handlers to update node inputs and outputs
  const { updateNodeDataIO, updateFlowVariablesObject } = useUpdateNodeDataIO();

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof nodeConfigZodSchema>) => {
    // Extract node inputs and outputs from formData
    const inputs: NodeInputType[] = inputKeys.map((key) => ({
      key,
      value: formData[key],
    }));
    const outputs: NodeOutputType[] = outputKeys.map((key) => ({
      key,
      value: formData[key],
    }));

    // Update node data inputs and outputs
    if (nodeId) {
      updateNodeDataIO(nodeId, inputs, outputs);

      // Update flow variables object
      if (outputKeys.length > 0) updateFlowVariablesObject(nodeId, outputs);
    } else {
      toast.error("Node id is undefined. Cannot update node data");
      console.error("Node id is undefined. Cannot update node data.");
    }

    // Close the dialog
    setShowDialog(false);
  };

  // Return the form
  return (
    <>
      {!isFormReady ? (
        <div>TODO: Loading...</div>
      ) : (
        <Form
          methods={form}
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form.getValues());
          }}
          className="px-2.5 pb-5"
        >
          {/* Input fields */}
          <div className="mt-1 space-y-3.5">
            {nodeConfig.map((field) => {
              // Check if the field should be rendered based on direction and renderIf conditions
              if (!shouldRenderField("Input", field, watchedValues))
                return null;

              // Render the field
              return <RenderField {...field} />;
            })}
          </div>

          {/* Output fields */}
          {outputKeys.length > 0 ? (
            <>
              <h3 className="!mt-6 flex items-center gap-1 text-sm font-medium">
                <span className="rounded-full bg-indigo-100 px-1.5 text-indigo-600">
                  Outputs
                </span>
                <span className="h-[0.06rem] flex-grow rounded bg-indigo-100"></span>
              </h3>

              <div className="rounded-lg border bg-slate-50 px-3.5 py-3">
                {nodeConfig.map((field) => {
                  // Check if the field should be rendered based on direction and renderIf conditions
                  if (!shouldRenderField("Output", field, watchedValues))
                    return null;

                  return <RenderField {...field} />;
                })}
              </div>
            </>
          ) : null}

          {/* Save button */}
          <div className="!mt-5 flex w-full justify-end">
            <Button type="submit" className="min-w-[5rem]">
              Save
            </Button>
          </div>
        </Form>
      )}
    </>
  );
};
