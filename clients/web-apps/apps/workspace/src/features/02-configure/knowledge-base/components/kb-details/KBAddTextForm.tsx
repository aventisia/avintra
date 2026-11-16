import { Form, InputField, TextareaField, crudDialogFieldClasses } from "@avplatform/ui/form";
import { IconTile } from "@avplatform/ui/icon-tile";
import { cn } from "@avplatform/ui/lib";
import { toast } from "@avplatform/ui/sonner";
import { TextTIcon } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { z } from "zod";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { StatusLine } from "@/components/card-dialog/StatusLine";

import {
  ingestVectorStoreInput,
  registerKnowledgeBaseText,
  updateKnowledgeBaseFileStatus,
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

/**
 * Card dialog that chunks pasted text into a knowledge base.
 */
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

  useEffect(() => {
    const timer = window.setTimeout(() => {
      form.setFocus("textContent");
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [form]);

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

      const registeredFileId = registered.data?.id;

      try {
        const ingestResult = await ingestVectorStoreInput({
          vector_store: knowledgeBase.vectorStore,
          embedding_provider: knowledgeBase.embeddingProvider,
          embedding_model: knowledgeBase.embeddingModel,
          input: data.textContent,
          metadata: {
            kb_name: knowledgeBaseName,
            doc_name: registered.data!.fileName,
          },
          chunk_size: data.chunkSize,
          chunk_overlap: data.chunkOverlap,
          credential_name: knowledgeBase.storeCredentialName ?? undefined,
          embedding_credential_name: knowledgeBase.embeddingCredentialName ?? undefined,
          ref_type: "KnowledgeBase",
          ref_id: knowledgeBaseId,
          ref_name: knowledgeBaseName,
          action: "KnowledgeBaseTextIngest",
        });

        const chunksCreated = (ingestResult as { chunks_created?: number })?.chunks_created ?? 0;

        if (registeredFileId) {
          await updateKnowledgeBaseFileStatus(knowledgeBaseId, registeredFileId, {
            status: "Completed",
            chunksCount: chunksCreated,
          });
        }
      } catch (ingestError) {
        if (registeredFileId) {
          await updateKnowledgeBaseFileStatus(knowledgeBaseId, registeredFileId, {
            status: "Failed",
            chunksCount: 0,
            errorMessage: ingestError instanceof Error ? ingestError.message : "Ingestion failed",
          });
        }
        throw ingestError;
      }
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

  const handleSubmit = form.handleSubmit(onSubmit);
  const { isDirty } = form.formState;

  return (
    <CardDialog
      isOpen
      onClose={onCompleted}
      isDismissLocked={isPending}
      isOutsideClickLocked={isDirty}
      widthClassName="w-[min(42rem,calc(100vw-2rem))]"
      mark={<IconTile Icon={TextTIcon} size="lg" className="size-12 rounded-lg [&>svg]:size-6" />}
      eyebrow="Add raw text"
      title={knowledgeBaseName}
      footer={
        <>
          <StatusLine tone={isPending ? "pending" : "idle"}>
            {isPending ? "Chunking text" : "Saved as a text file"}
          </StatusLine>
          <div className="flex shrink-0 items-center gap-2">
            <CardDialogButton onClick={onCompleted} disabled={isPending}>
              Cancel
            </CardDialogButton>
            <CardDialogButton
              variant="primary"
              onClick={handleSubmit}
              disabled={isPending}
              isBusy={isPending}
            >
              {isPending ? "Chunking" : "Add text"}
            </CardDialogButton>
          </div>
        </>
      }
    >
      <Form methods={form} onSubmit={handleSubmit}>
        <TextareaField
          {...textContentProps}
          className={cn(crudDialogFieldClasses.textarea, textContentProps.className)}
          autoFocus
        />

        <div className="grid grid-cols-2 gap-4">
          <InputField {...chunkSizeProps} className={crudDialogFieldClasses.input} />
          <InputField {...chunkOverlapProps} className={crudDialogFieldClasses.input} />
        </div>

        <FileUploadDisclaimer className="px-0 leading-5 text-muted-foreground" />
      </Form>
    </CardDialog>
  );
};
