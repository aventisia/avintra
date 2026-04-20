import { Button, SubmitButton } from "@aventisia/ui/buttons";
import { Form, InputField } from "@aventisia/ui/form";
import { ScrollArea } from "@aventisia/ui/scroll";
import { toast } from "@aventisia/ui/sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileTextIcon, XIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
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

interface FileWithDataURI {
  id: string;
  file: File;
  dataUri: string;
}

export const KBAddFileForm = ({
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
  const { form } = useDefineKBAddFilesForm();
  const queryClient = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState<FileWithDataURI[]>([]);

  const fileInputId = useMemo(() => `file-input-${Math.random()}`, []);

  /**
   * Convert file to data URI
   */
  const fileToDataUri = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const dataUri = await fileToDataUri(file);
      setSelectedFiles([
        {
          id: crypto.randomUUID(),
          file,
          dataUri,
        },
      ]);

      // Reset input
      event.target.value = "";
    },
    [fileToDataUri],
  );

  /**
   * Remove file from selection
   */
  const handleRemoveFile = useCallback((id: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const { mutate: submitFiles, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof kbAddFilesSchema>) => {
      if (!knowledgeBase) {
        throw new Error("Knowledge base configuration is not available");
      }

      for (const fileItem of selectedFiles) {
        const registered = await registerKnowledgeBaseFile(knowledgeBaseId, {
          fileUrl: fileItem.dataUri,
          fileName: fileItem.file.name,
          fileSizeInBytes: fileItem.file.size,
          fileExtension: fileItem.file.name.split(".").pop() || "",
          chunkSize: data.chunkSize,
          chunkOverlap: data.chunkOverlap,
        });

        await ingestVectorStoreInput({
          vector_store: knowledgeBase.vectorStore,
          embedding_provider: knowledgeBase.embeddingProvider,
          embedding_model: knowledgeBase.embeddingModel,
          input: fileItem.dataUri,
          metadata: {
            kb_id: knowledgeBaseId,
            kb_file_id: registered.data!.id,
            kb_name: knowledgeBaseName,
            kb_file_name: fileItem.file.name,
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
      setSelectedFiles([]);
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
            {/* File Input */}
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-medium text-slate-700">
                Select File
              </h4>
              <label
                htmlFor={fileInputId}
                className="flex items-center h-20 justify-center rounded-lg border-2 border-dashed border-gray-300 p-4 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <span className="text-sm font-medium text-gray-600">
                  Click to browse (.pdf, .docx, .txt)
                </span>
                <input
                  id={fileInputId}
                  type="file"
                  accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-medium text-slate-700">
                  Selected Files ({selectedFiles.length})
                </h4>
                <div className="flex flex-col gap-2">
                  {selectedFiles.map((fileItem) => {
                    return (
                      <div
                        key={fileItem.id}
                        className="flex items-center justify-between rounded-xl bg-muted p-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-white rounded-full flex items-center justify-center h-10 w-10 shadow-sm border border-indigo-100">
                            <FileTextIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex flex-col">
                            <p className="text-sm font-medium truncate max-w-[200px]">
                              {fileItem.file.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {(fileItem.file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={() => handleRemoveFile(fileItem.id)}
                          variant="caution"
                          size="icon7"
                          disabled={isPending}
                          aria-label="Remove file"
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chunk Configuration */}
            <div className="grid grid-cols-2 gap-2">
              <InputField {...chunkSizeProps} />
              <InputField {...chunkOverlapProps} />
            </div>
          </div>
        </ScrollArea>
        <div className="flex h-16 border-t px-4 justify-end gap-3 items-center">
          <SubmitButton
            size={"sm"}
            type="submit"
            isPending={isPending}
            primaryText="Submit"
            secondaryText="Chunking..."
            disabled={isPending || selectedFiles.length === 0}
          />
        </div>
      </div>
    </Form>
  );
};
