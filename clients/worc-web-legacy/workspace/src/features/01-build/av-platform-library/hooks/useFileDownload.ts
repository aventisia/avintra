import { useMutation } from "@tanstack/react-query";

import { downloadTemplateResource } from "../apis/av-platform-templates-apis";
import { FileResource } from "../dtos/use-template-dto";

export const useDownloadFile = (isPublic?: boolean) => {
  return useMutation({
    mutationFn: (file: FileResource) =>
      downloadTemplateResource(file.path, isPublic),
    onSuccess: (data, file) => {
      // Create a download link dynamically
      const url = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;

      //Set download file name
      const fileName = file.name || "template_resource";
      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
};
