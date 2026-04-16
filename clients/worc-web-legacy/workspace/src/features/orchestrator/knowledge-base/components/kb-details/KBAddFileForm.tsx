import { FileUploadDto } from "@/components/file-uploader/apis/file-upload-apis";
import { formatFileSize } from "@/components/file-uploader/utils/file-uploader-util";

import { Button } from "@aventisia/ui/buttons";
import { Form, InputField } from "@aventisia/ui/form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileTextIcon } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { z } from "zod";

import {
  ingestVectorStoreInput,
  registerKnowledgeBaseFile,
} from "../../apis/knowledge-base-file-apis";
import { DETAIL_DATA_QUERY_KEY } from "../../constants";
import { kbAddFilesSchema } from "../../constants/kb-add-files-zod-schema";
import {
  chunkOverlapProps,
  chunkSizeProps,
} from "../../constants/kb-add-text-feild-props";
import { KnowledgeBaseTableDto } from "../../dtos/knowledge-base-table-dto";
import { useDefineKBAddFilesForm } from "../../hooks/useDefineKBAddFilesForm";

export const KBAddFileForm = ({
  files,
  setUploadStep,
  knowledgeBaseId,
  knowledgeBaseName,
  knowledgeBase,
  onCompleted,
}: {
  files: FileUploadDto[];
  setUploadStep: Dispatch<SetStateAction<number>>;
  knowledgeBaseId: string;
  knowledgeBaseName: string;
  knowledgeBase?: KnowledgeBaseTableDto;
  onCompleted: () => void;
}) => {
  const { form } = useDefineKBAddFilesForm();
  const queryClient = useQueryClient();

  const { mutate: submitFiles, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof kbAddFilesSchema>) => {
      if (!knowledgeBase) {
        throw new Error("Knowledge base configuration is not available");
      }

      for (const file of files) {
        const registered = await registerKnowledgeBaseFile(knowledgeBaseId, {
          fileUrl: file.path,
          fileName: file.name,
          fileSizeInBytes: file.size,
          fileExtension: file.extension,
          chunkSize: data.chunkSize,
          chunkOverlap: data.chunkOverlap,
        });

        await ingestVectorStoreInput({
          vector_store: knowledgeBase.vectorStore,
          embedding_provider: knowledgeBase.embeddingProvider,
          embedding_model: knowledgeBase.embeddingModel,
          input: file.path,
          metadata: {
            doc_name: file.name,
            kb_file_id: registered.data!.id,
          },
          chunk_size: data.chunkSize,
          chunk_overlap: data.chunkOverlap,
          store_credential_id: knowledgeBase.storeCredentialId,
          embedding_credential_id: knowledgeBase.embeddingCredentialId,
          ref_type: "KnowledgeBase",
          ref_id: knowledgeBaseId,
          ref_name: knowledgeBaseName,
          action: "KnowledgeBaseFileIngest",
        });
      }
    },
    onSuccess: async () => {
      toast.success("Files added to knowledge base successfully");
      await queryClient.invalidateQueries({
        queryKey: [...DETAIL_DATA_QUERY_KEY, knowledgeBaseId],
      });
      onCompleted();
    },
    onError: (error) => {
      toast.error((error as Error).message || "Failed to add files");
    },
  });

  const onSubmit = (data: z.infer<typeof kbAddFilesSchema>) => {
    submitFiles(data);
  };

  return (
    <Form
      methods={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-0 p-0 h-full "
    >
      <div className="flex flex-col justify-between">
        <ScrollArea className="h-[calc(85vh-7.5rem)] p-4 pt-3 ">
          <div className="space-y-4">
            {files?.length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-medium text-slate-700">
                  Selected Files
                </h4>
                <div className="flex flex-col gap-2">
                  {files.map((file) => {
                    return (
                      <div
                        key={file.name}
                        className="flex items-center justify-between rounded-xl bg-muted p-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-white rounded-full flex items-center justify-center h-10 w-10 shadow-sm border border-indigo-100">
                            <FileTextIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex flex-col">
                            <p className="text-sm font-medium truncate max-w-[200px]">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatFileSize(file.size)}{" "}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Number of chunks */}
            <div className="grid grid-cols-2 gap-2">
              <InputField {...chunkSizeProps} />

              <InputField {...chunkOverlapProps} />
            </div>
          </div>
        </ScrollArea>
        <div className="flex h-16 border-t px-4 justify-end gap-3 items-center">
          <Button
            size={"sm"}
            type="button"
            variant="outline"
            onClick={() => setUploadStep(0)}
            disabled={isPending}
          >
            Back
          </Button>
          <Button size={"sm"} type="submit" disabled={isPending}>
            Submit Files
          </Button>
        </div>
      </div>
    </Form>
  );
};
