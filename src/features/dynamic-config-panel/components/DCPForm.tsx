import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { NodeInputType, NodeOutputType } from "@/types/node-data-type";
import { Button } from "@aventisia/ui/buttons";
import { Form } from "@aventisia/ui/form";
import { toast } from "@aventisia/ui/sonner";
import { SearchCodeIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";
import {
  RenderField,
  shouldRenderField,
  useDefineDCPForm,
  useUpdateNodeDataIO,
} from "..";
import { LoadingSpinner } from "@aventisia/ui";
import { parseIfValidJson } from "../utils/valid-json-utils";

export const DCPForm = () => {
  const [showOuputFields, setShowOutputFields] = useState(false);

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
    nodeLabel,
    setShowDialog,
    isLoading,
  } = useDefineDCPForm();

  // Watch all form values
  const watchedValues = watch();

  // Get handlers to update node inputs and outputs
  const { updateNodeDataIO, updateFlowVariablesObject } = useUpdateNodeDataIO();

  // Get ReactFlowExt store state & actions
  const { isPublished } = useReactFlowExtStore(
    useShallow((state) => ({
      isPublished: state.isPublished,
    })),
  );

  // Check if output fields should be shown based on node configuration and watched values
  useEffect(() => {
    const renderedOutputFields = nodeConfig.filter((field) =>
      shouldRenderField("Output", field, watchedValues),
    );

    setShowOutputFields(
      renderedOutputFields.map((field) => field.name).length > 0,
    );
  }, [isFormReady, nodeConfig, watchedValues]);

  // Define submit handler
  const onSubmit = (formData: z.infer<typeof nodeConfigZodSchema>) => {
    // Extract node inputs and outputs from formData
    const inputs: NodeInputType[] = inputKeys.map((key) => ({
      key,
      value: parseIfValidJson(formData[key]),
    }));
    const outputs: NodeOutputType[] = outputKeys.map((key) => ({
      key,
      value: formData[key],
    }));

    // Update node data inputs and outputs
    if (nodeId) {
      updateNodeDataIO(nodeId, nodeLabel || "", inputs, outputs);

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
      {isLoading ? (
        <div className="flex h-[calc(100vh-9rem)] items-center justify-center gap-2 text-sm">
          <LoadingSpinner className="h-5 w-5 text-primary" />
        </div>
      ) : !isFormReady ? (
        <div className="flex h-[calc(100vh-9rem)] items-center justify-center gap-2 text-sm">
          <SearchCodeIcon className="text-icon h-5 w-5" />
          Configuration not found for this node.
        </div>
      ) : (
        <Form
          methods={form}
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form.getValues());
          }}
          className="px-2.5 pb-5"
          disabled={isPublished}
        >
          {/* Input fields */}
          <div className="mt-1 space-y-3.5">
            {nodeConfig.map((field) => {
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

          {/* Output fields */}
          {showOuputFields ? (
            <>
              <h3 className="!mt-6 flex items-center gap-1 text-sm font-medium">
                <span className="rounded-full bg-accent px-1.5 text-indigo-600">
                  Outputs
                </span>
                <span className="h-[0.06rem] flex-grow rounded bg-accent"></span>
              </h3>

              <div className="space-y-3 rounded-lg border bg-slate-50 px-3.5 py-3">
                {nodeConfig.map((field) => {
                  // Check if the field should be rendered based on direction and renderIf conditions
                  if (!shouldRenderField("Output", field, watchedValues)) {
                    //Remove the key from outputKeys if the field is not rendered
                    if (outputKeys.includes(field.name))
                      outputKeys.splice(outputKeys.indexOf(field.name), 1);
                    return null;
                  }

                  // Add the field name to outputKeys if not already present
                  if (!outputKeys.includes(field.name))
                    outputKeys.push(field.name);

                  return <RenderField key={field.name} {...field} />;
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
