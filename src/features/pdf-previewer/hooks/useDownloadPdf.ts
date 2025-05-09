import { useMutation } from "@tanstack/react-query";
import { useFileListStore } from "../../multi-format-viewer/store/pdf-list-store";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

// Custom hook for downloading PDF
export const useDownloadPdf = () => {
  const setPdfUrl = useFileListStore((state) => state.setFileUrl);
  const baseAPIURL: string = `${import.meta.env.VITE_AI_STUDIO_API_URL}/upload-doc`;

  return useMutation({
    mutationFn: async (path: string) => {
      const response = await axiosInstance.get(
        `${baseAPIURL}?fileurl=${path}`,
        {
          responseType: "blob",
        },
      );
      return URL.createObjectURL(response.data);
    },
    onSuccess: (url) => {
      setPdfUrl(url);
    },
    onError: (error) => {
      console.error("Error downloading PDF:", error);
      setPdfUrl(null);
    },
  });
};
