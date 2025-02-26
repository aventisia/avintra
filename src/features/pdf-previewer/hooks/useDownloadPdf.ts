import { useMutation } from "@tanstack/react-query";
import { usePdfListStore } from "../stores/pdf-list-store";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

// Custom hook for downloading PDF
export const useDownloadPdf = () => {
  const setPdfUrl = usePdfListStore((state) => state.setPdfUrl);
  const baseAPIURL: string = `${import.meta.env.VITE_ML_MODELBUILDER_API_URL}/upload-doc`;

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
