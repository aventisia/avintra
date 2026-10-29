import { Button } from "@avplatform/ui/buttons";
import { DefaultTenantsEnum } from "@avplatform/ui/enums";
import { InputField } from "@avplatform/ui/form";
import { SelectField } from "@avplatform/ui/form";
import { Form } from "@avplatform/ui/form";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { enumToArray } from "@avplatform/ui/utils";
import { Loader2, Plus } from "lucide-react";
import { useEffect } from "react";
import { Controller } from "react-hook-form";
import { useShallow } from "zustand/react/shallow";

import InputFields from "@/features/add-input-output/components/InputFields";
import OutputFields from "@/features/add-input-output/components/OutputFields";
import { formDataToDCPJson } from "@/features/add-input-output/utils/formdataToJson";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

import { AccessTypeEnum } from "../../constants/access-type-enum";
import { createBlockFormType } from "../../constants/flow-block-zod-schema";
import { FlowBlockDto } from "../../dtos/flow-block-dtos";
import { useDeleteBlockMutation } from "../../hooks/useDeleteBlockMutation";
import { useFlowBlockForm } from "../../hooks/useFlowBlockForm";
import { useInsertBlockMutation } from "../../hooks/useInsertBlockMutation";
import { useUpdateBlockMutation } from "../../hooks/useUpdateBlockMutation";
import { useFlowBlockStore } from "../../stores/flow-block-store";

export const FlowBlockCrudForm = () => {
  // Define flow form
  const {
    form,
    rowId,
    control,
    isDirty,
    crudAction,
    // setShowDialog,
    refineFormData,
    appendInput,
    appendOutput,
    inputDefault,
    inputFields,
    outputDefault,
    outputFields,
    removeInput,
    removeOutput,
  } = useFlowBlockForm();

  // Get global store state & actions
  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
    })),
  );

  const { flowBlockObject } = useFlowBlockStore(
    useShallow((state) => ({
      flowBlockObject: state.flowBlockObject,
    })),
  );

  //Mutation to insert block
  const { mutate: insertBlock, isPending } = useInsertBlockMutation();

  //Mutation to update block
  const { mutate: updateBlock, isPending: isUpdating } = useUpdateBlockMutation();

  //Mutation to delete block
  const { mutate: deleteBlock } = useDeleteBlockMutation();

  // Get showAlert handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  //Add single inputs outputs fields for initial form
  useEffect(() => {
    if (crudAction == "create") {
      if (form.getValues("inputs")?.length == 0) {
        appendInput(inputDefault);
      }
      if (form.getValues("outputs")?.length == 0) {
        appendOutput(outputDefault);
      }
    }
  }, []);

  // Define submit handler
  const onSubmit = (formData: createBlockFormType) => {
    if (crudAction == "create")
      // Create or update the flow
      insertBlock({
        ...refineFormData(formData),
        id: rowId,
        flowVersionId: currentFlow.versionId,
        reactFlowObject: JSON.stringify(flowBlockObject),
        inputOutputObject: JSON.stringify(formDataToDCPJson(formData)),
      } as unknown as FlowBlockDto);
    if (crudAction == "update")
      // Create or update the flow
      updateBlock({
        ...refineFormData(formData),
        flowVersionId: currentFlow.versionId,
        reactFlowObject: JSON.stringify(flowBlockObject),
        inputOutputObject: JSON.stringify(formDataToDCPJson(formData)),
      } as unknown as FlowBlockDto);
  };

  // Get user session state and actions
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const isIndividualUser = userSession?.tenantName === DefaultTenantsEnum.IndividualUsers;

  const selectOptions = enumToArray(AccessTypeEnum).filter(
    (item: { label: string; value: string }) => {
      if (isIndividualUser && item.value == "TenantLevel") return false;
      else return true;
    },
  );

  // Return the form
  return (
    <Form methods={form} onSubmit={form.handleSubmit(onSubmit)} className="px-2.5 pb-5">
      <div className="grid grid-cols-2 items-center gap-2.5">
        <Controller
          name={"name"}
          control={control}
          render={({ field }) => (
            <InputField
              {...field}
              fieldSize="xs"
              description="Enter name for the block node"
              label="Block name"
            />
          )}
        />
        <Controller
          name={`type`}
          control={control}
          render={({ field }) => (
            <SelectField
              {...field}
              label="Access type"
              description="Select the access type"
              size="xs"
              selectOptions={selectOptions}
            />
          )}
        />
        <div className="col-span-2">
          <Controller
            name={"description"}
            control={control}
            render={({ field }) => (
              <InputField
                {...field}
                fieldSize="xs"
                description="Enter description for the block node"
                label="Block description"
              />
            )}
          />
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2>Inputs</h2>
          <Button variant="ghost" type="button" size="sm" onClick={() => appendInput(inputDefault)}>
            <Plus className="h-4 w-4" />
            Field
          </Button>
        </div>
        {inputFields.map((field, index) => (
          <InputFields field={field} control={control} index={index} remove={removeInput} />
        ))}
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2>Outputs</h2>
          <Button
            variant="ghost"
            type="button"
            size="sm"
            onClick={() => appendOutput(outputDefault)}
          >
            <Plus className="h-4 w-4" />
            Field
          </Button>
        </div>
        {outputFields.map((field, index) => (
          <OutputFields field={field} control={control} index={index} remove={removeOutput} />
        ))}
      </div>
      {/* Submit button */}
      <div
        className={`!mt-5 flex w-full ${crudAction == "update" ? "justify-between" : "justify-end"}`}
      >
        {crudAction !== "create" && (
          <Button
            type="button"
            className="rounded-lg border border-destructive"
            variant={"caution"}
            onClick={() => {
              showDefaultAlertDialog({
                confirmActionFn: () => deleteBlock(rowId),
                alertType: "delete-record",
                additionalText: "block",
              });
            }}
          >
            Delete
          </Button>
        )}
        <Button
          type="submit"
          disabled={!isDirty || isPending || isUpdating}
          className="min-w-[5rem]"
        >
          {isPending || isUpdating ? (
            <div className="flex items-center gap-1">
              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              <span>Saving</span>
            </div>
          ) : crudAction === "create" ? (
            "Save"
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </Form>
  );
};
