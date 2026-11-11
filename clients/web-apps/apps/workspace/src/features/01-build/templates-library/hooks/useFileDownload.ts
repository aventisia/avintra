import { downloadBlob } from "@avplatform/ui/utils";
import { useMutation } from "@tanstack/react-query";

import { downloadTemplateResource } from "../apis/avplatform-templates-apis";
import { FileResource } from "../dtos/use-template-dto";

export const useDownloadFile = (isPublic?: boolean) => {
  return useMutation({
    mutationFn: (file: FileResource) => downloadTemplateResource(file.path, isPublic),
    onSuccess: (data, file) => downloadBlob(data, file.name || "template_resource"),
  });
};
