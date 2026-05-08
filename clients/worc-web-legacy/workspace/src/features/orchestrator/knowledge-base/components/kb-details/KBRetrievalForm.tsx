import { SliderField } from "@/components/Slider/SliderField";

import { Button, SubmitButton } from "@aventisia/ui/buttons";
import { Form, InputField, TextareaField } from "@aventisia/ui/form";
import { toast } from "@aventisia/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { Dispatch, SetStateAction } from "react";
import { Controller } from "react-hook-form";
import { z } from "zod";

import {
  RetrievedChunkDto,
  queryVectorStore,
} from "../../apis/knowledge-base-file-apis";
import {
  numberOfChunksProps,
  queryProps,
} from "../../constants/kb-retrieval-feild-props";
import { knowledgeBaseRetrievalSchema } from "../../constants/kb-retrieval-zod-schema";
import { KnowledgeBaseTableDto } from "../../dtos/knowledge-base-table-dto";
import { useDefineKnowledgeBaseRetrievalForm } from "../../hooks/useDefineKBRetrievalForm";

export const KnowledgeBaseRetrievalForm = ({
  setChunksRetrieved,
  setChunks,
  knowledgeBaseId,
  knowledgeBaseName,
  knowledgeBase,
}: {
  setChunksRetrieved: Dispatch<SetStateAction<boolean>>;
  setChunks: Dispatch<SetStateAction<RetrievedChunkDto[]>>;
  knowledgeBaseId: string;
  knowledgeBaseName: string;
  knowledgeBase?: KnowledgeBaseTableDto;
}) => {
  const { form } = useDefineKnowledgeBaseRetrievalForm();

  const { mutate: retrieveChunks, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof knowledgeBaseRetrievalSchema>) => {
      if (!knowledgeBase) {
        throw new Error("Knowledge base configuration is not available");
      }

      return queryVectorStore({
        vector_store: knowledgeBase.vectorStore,
        embedding_provider: knowledgeBase.embeddingProvider,
        embedding_model: knowledgeBase.embeddingModel,
        query: data.query,
        top_k: data.numberOfChunks,
        kb_ids: [knowledgeBaseId],
        score_threshold: data.scoreThreshold,
        embedding_credential_id: knowledgeBase.embeddingCredentialId,
        store_credential_id: knowledgeBase.storeCredentialId,
        ref_type: "KnowledgeBase",
        ref_id: knowledgeBaseId,
        ref_name: knowledgeBaseName,
        action: "KnowledgeBaseRetrieval",
      });
    },
    onSuccess: (response) => {
      setChunks(response?.chunks ?? []);
      setChunksRetrieved(true);
    },
    onError: (error) => {
      toast.error((error as Error).message || "Failed to retrieve chunks");
    },
  });

  const onSubmit = (data: z.infer<typeof knowledgeBaseRetrievalSchema>) => {
    retrieveChunks(data);
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

      {/* Score threshold */}
      <Controller
        control={form.control}
        name={`scoreThreshold`}
        render={({ field }) => {
          return (
            <SliderField
              name={field.name}
              min={0}
              max={1.0}
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

        <SubmitButton
          size={"sm"}
          type="submit"
          isPending={isPending}
          primaryText="Retrieve"
          secondaryText="Retrieving..."
          disabled={isPending}
        />
      </div>
    </Form>
  );
};
