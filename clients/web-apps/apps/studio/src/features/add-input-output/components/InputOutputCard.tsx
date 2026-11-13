import { IconTile } from "@avplatform/ui/icon-tile";
import { applyFlowInputsToVariables } from "@avplatform/ui/utils";
import { ArrowsLeftRightIcon } from "@phosphor-icons/react";
import { useViewport } from "@xyflow/react";
import { useEffect, useId, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { StatusLine } from "@/components/card-dialog/StatusLine";
import { useCurrentFlowStore } from "@/stores/current-flow-store";
import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";

import { InputsOutputsFieldsFormType } from "../constants/inputs-outputs-zod-schema";
import { useInputsOutputsForm } from "../hooks/useInputsOutputsForm";
import { useUpdateInputOutput } from "../hooks/useUpdateInputOutput";
import { formDataToDCPJson } from "../utils/formdataToJson";
import { FieldSection } from "./FieldSection";
import InputFields from "./InputFields";
import { InputOutputSkeleton } from "./InputOutputSkeleton";
import OutputFields from "./OutputFields";

type InputOutputCardProps = {
  onClose: () => void;
};

const pluralize = (count: number, noun: string) => `${count} ${noun}${count === 1 ? "" : "s"}`;

/**
 * The agent's input and output fields in the card dialog style. Saving stores them on the flow
 * and syncs the flow variables.
 */
export const InputOutputCard = ({ onClose }: InputOutputCardProps) => {
  const {
    form,
    isLoading,
    inputFields,
    inputDefault,
    outputDefault,
    removeInput,
    appendInput,
    appendOutput,
    outputFields,
    removeOutput,
  } = useInputsOutputsForm();
  const bodyRef = useRef<HTMLDivElement>(null);
  const formId = `${useId()}-form`;

  const { currentFlow, setCurrentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
      setCurrentFlow: state.setCurrentFlow,
    })),
  );

  const { nodes, edges, setInputOutputObject } = useReactFlowExtStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      setInputOutputObject: state.setInputOutputObject,
    })),
  );

  const viewportState = useViewport();
  const { mutate: updateInputOutput } = useUpdateInputOutput();

  const { isDirty, isSubmitted, isValid } = form.formState;
  const hasErrors = isSubmitted && !isValid;

  useEffect(() => {
    if (isLoading || bodyRef.current?.contains(document.activeElement)) return;
    bodyRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, [isLoading]);

  const onSubmit = (formData: InputsOutputsFieldsFormType) => {
    const refinedData = formDataToDCPJson(formData);

    setInputOutputObject(refinedData);

    const { flowVariablesObject, syncFlowVariablesAndRebaseline } = useReactFlowExtStore.getState();

    syncFlowVariablesAndRebaseline(applyFlowInputsToVariables(flowVariablesObject, refinedData));

    updateInputOutput({
      id: currentFlow.id,
      reactFlowObject: JSON.stringify({ nodes, edges, viewport: viewportState }),
      versionId: currentFlow.versionId,
      inputOutputObject: JSON.stringify(refinedData),
    });

    setCurrentFlow({
      ...currentFlow,
      inputOutputObject: JSON.stringify(refinedData),
    });

    onClose();
  };

  return (
    <CardDialog
      isOpen
      onClose={onClose}
      isOutsideClickLocked={isDirty}
      widthClassName="w-[min(40rem,calc(100vw-2rem))]"
      mark={
        <IconTile
          Icon={ArrowsLeftRightIcon}
          size="xl"
          className="size-12 rounded-lg text-primary-text [&>svg]:size-6"
        />
      }
      eyebrow="Input/output"
      title={currentFlow.name}
      footer={
        <>
          {isLoading ? (
            <span />
          ) : hasErrors ? (
            <StatusLine tone="error">Fix the highlighted fields</StatusLine>
          ) : isDirty ? (
            <StatusLine tone="pending">Unsaved changes</StatusLine>
          ) : (
            <StatusLine tone="idle">
              {pluralize(inputFields.length, "input")} · {pluralize(outputFields.length, "output")}
            </StatusLine>
          )}
          <div className="flex shrink-0 items-center gap-2">
            <CardDialogButton onClick={onClose}>Cancel</CardDialogButton>
            <CardDialogButton type="submit" form={formId} variant="primary" disabled={isLoading}>
              Save changes
            </CardDialogButton>
          </div>
        </>
      }
    >
      <div ref={bodyRef} aria-busy={isLoading}>
        {isLoading ? (
          <InputOutputSkeleton />
        ) : (
          <form id={formId} onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
            <p className="text-[12.5px] leading-5 text-muted-foreground">
              Inputs are the values someone fills in to run this agent. Outputs are the variables it
              returns when it finishes.
            </p>

            <FieldSection
              title="Inputs"
              count={inputFields.length}
              addLabel="Add input"
              emptyTitle="No inputs"
              emptyHint="The agent runs without asking for any values"
              onAdd={() => appendInput(inputDefault)}
            >
              {inputFields.map((field, index) => (
                <InputFields
                  key={field.id}
                  form={form}
                  index={index}
                  onRemove={() => removeInput(index)}
                />
              ))}
            </FieldSection>

            <FieldSection
              title="Outputs"
              count={outputFields.length}
              addLabel="Add output"
              emptyTitle="No outputs"
              emptyHint="The agent doesn’t return any variables"
              onAdd={() => appendOutput(outputDefault)}
            >
              {outputFields.map((field, index) => (
                <OutputFields
                  key={field.id}
                  form={form}
                  index={index}
                  onRemove={() => removeOutput(index)}
                />
              ))}
            </FieldSection>
          </form>
        )}
      </div>
    </CardDialog>
  );
};
