import { SliderField } from "@/components/Slider/SliderField";

import { Button } from "@aventisia/ui/buttons";
import {
  Form,
  InputField,
  SelectField,
  TextareaField,
} from "@aventisia/ui/form";
import { Dispatch, SetStateAction } from "react";
import { Controller } from "react-hook-form";
import { z } from "zod";

import {
  numberOfChunksProps,
  queryProps,
  retrievalTypeProps,
} from "../../constants/kb-retrieval-feild-props";
import { knowledgeBaseRetrievalSchema } from "../../constants/kb-retrieval-zod-schema";
import { useDefineKnowledgeBaseRetrievalForm } from "../../hooks/useDefineKBRetrievalForm";

export const KnowledgeBaseRetrievalForm = ({
  setChunksRetrieved,
}: {
  setChunksRetrieved: Dispatch<SetStateAction<boolean>>;
}) => {
  const { form } = useDefineKnowledgeBaseRetrievalForm();

  const onSubmit = (data: z.infer<typeof knowledgeBaseRetrievalSchema>) => {
    console.log("Retrieval Payload:", data);
    setChunksRetrieved(true);
  };

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4 p-4 pt-1"
    >
      {/* Query */}
      <TextareaField {...queryProps} />

      {/* Number of chunks */}
      <InputField {...numberOfChunksProps} />

      {/* Retrieval type */}
      <SelectField {...retrievalTypeProps} />

      {/* Score threshold */}

      <Controller
        control={form.control}
        name={`scoreThreshold`}
        render={({ field }) => {
          return (
            <SliderField
              name={field.name}
              value={[field.value ?? 0]}
              onValueChange={(val) => field.onChange(val[0])}
              onValueCommit={field.onBlur}
              min={0}
              max={1.2}
              step={0.1}
              className="text-sm resize-none"
              label="Score Threshold"
              isRequired
            />
          );
        }}
      />

      {/* Actions */}
      <div className="flex justify-end gap-2.5 pt-4">
        <Button
          size={"sm"}
          type="button"
          variant="outline"
          onClick={() => form.reset()}
        >
          Reset
        </Button>

        <Button size={"sm"} type="submit">
          Retrieve
        </Button>
      </div>
    </Form>
  );
};
