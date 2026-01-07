import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { useMutation } from "@tanstack/react-query";

import { useFileListStore } from "../store/file-list-store";

// Custom hook for downloading Files
export const useDownloadFile = () => {
  const setFileUrl = useFileListStore((state) => state.setFileUrl);
  const baseAPIURL: string = `${import.meta.env.VITE_AISTUDIO_API_PATH}/upload-doc`;

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
      setFileUrl(url);
    },
    onError: (error) => {
      console.error("Error downloading File:", error);
      setFileUrl(null);
    },
  });
};
