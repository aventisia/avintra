import { Button } from "@aventisia/ui/buttons";
import { Form, InputField, TextareaField } from "@aventisia/ui/form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import {
  ingestVectorStoreInput,
  registerKnowledgeBaseText,
} from "../../apis/knowledge-base-file-apis";
import { DETAIL_DATA_QUERY_KEY } from "../../constants";
import {
  chunkOverlapProps,
  chunkSizeProps,
  textContentProps,
} from "../../constants/kb-add-text-feild-props";
import { kbAddTextSchema } from "../../constants/kb-add-text-zod-schema";
import { KnowledgeBaseTableDto } from "../../dtos/knowledge-base-table-dto";
import { useDefineKBAddTextForm } from "../../hooks/useDefineKBAddTextForm";
import FileUploadDisclaimer from "./FileUploadDisclaimer";

export const KBAddTextForm = ({
  knowledgeBaseId,
  knowledgeBaseName,
  knowledgeBase,
  onCompleted,
}: {
  knowledgeBaseId: string;
  knowledgeBaseName: string;
  knowledgeBase?: KnowledgeBaseTableDto;
  onCompleted: () => void;
}) => {
  const { form } = useDefineKBAddTextForm();
  const queryClient = useQueryClient();

  const generateFileNameFromText = (text: string, wordLimit = 5) => {
    if (!text) return "untitled.txt";

    const words = text.trim().split(/\s+/).slice(0, wordLimit).join(" ");

    return (
      words
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "") // remove special chars
        .replace(/\s+/g, "-") + ".txt"
    );
  };

  const { mutate: submitText, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof kbAddTextSchema>) => {
      if (!knowledgeBase) {
        throw new Error("Knowledge base configuration is not available");
      }

      const fileName = generateFileNameFromText(data.textContent, 5);

      const registered = await registerKnowledgeBaseText(knowledgeBaseId, {
        textContent: data.textContent,
        fileName,
        chunkSize: data.chunkSize,
        chunkOverlap: data.chunkOverlap,
      });

      await ingestVectorStoreInput({
        vector_store: knowledgeBase.vectorStore,
        embedding_provider: knowledgeBase.embeddingProvider,
        embedding_model: knowledgeBase.embeddingModel,
        input: data.textContent,
        metadata: {
          kb_id: knowledgeBaseId,
          kb_file_id: registered.data!.id,
          kb_name: knowledgeBaseName,
          kb_file_name: fileName,
        },
        chunk_size: data.chunkSize,
        chunk_overlap: data.chunkOverlap,
        store_credential_id: knowledgeBase.storeCredentialId,
        embedding_credential_id: knowledgeBase.embeddingCredentialId,
        ref_type: "KnowledgeBase",
        ref_id: knowledgeBaseId,
        ref_name: knowledgeBaseName,
        action: "KnowledgeBaseTextIngest",
      });
    },
    onSuccess: async () => {
      toast.success("Text added to knowledge base successfully");
      await queryClient.invalidateQueries({
        queryKey: [...DETAIL_DATA_QUERY_KEY, knowledgeBaseId],
      });
      onCompleted();
    },
    onError: (error) => {
      toast.error((error as Error).message || "Failed to add text");
    },
  });

  const onSubmit = (data: z.infer<typeof kbAddTextSchema>) => {
    submitText(data);
  };

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-0 p-0 "
    >
      <div className="flex flex-col justify-between">
        <ScrollArea className="h-[calc(85vh-7.5rem)] p-4 pt-3 ">
          <div className="space-y-4">
            {/* Query */}
            <TextareaField {...textContentProps} />

            {/* Number of chunks */}
            <div className="grid grid-cols-2 gap-2">
              <InputField {...chunkSizeProps} />

              <InputField {...chunkOverlapProps} />
            </div>

            <FileUploadDisclaimer />
          </div>
        </ScrollArea>

        <div className="flex h-16 border-t px-4 justify-end items-center">
          <Button size={"sm"} type="submit" disabled={isPending}>
            Add Text
          </Button>
        </div>
      </div>
    </Form>
  );
};
