// hooks/useDeleteInsertedFile.ts
// import { toast } from "@aventisia/ui/sonner";
import { deleteInsertedFileById } from "@/features/file-uploader-setup/apis/file-upload-apis";

import { useMutation } from "@tanstack/react-query";

type MutationParams = {
  id: string;
};

export const useDeleteInsertedFiles = () => {
  const { mutateAsync: removeInsertedDocument } = useMutation({
    mutationFn: ({ id }: MutationParams) => deleteInsertedFileById(id),
    // onError: (error) => {
    //   toast.error(error.toString());
    // },
  });

  return {
    removeInsertedDocument,
  };
};
