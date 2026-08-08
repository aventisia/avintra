import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import type { DownloadManifestDto } from "../dtos/download-manifest.dto";

/**
 * Retrieves the download manifest for the desktop applications.
 */
const getDownloadManifest = async () => {
  const response = await axiosInstance.get<DownloadManifestDto>(
    `${import.meta.env.VITE_ACCOUNTS_API_PATH}/binaries/download-manifest`,
  );
  return response.data;
};

export { getDownloadManifest };
