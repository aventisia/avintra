import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import type { DownloadManifestDto } from "../dtos/download-manifest.dto";

/**
 * Retrieves the download manifest for the desktop applications.
 *
 * The AccountsAPIs endpoint wraps the manifest in a ServiceResponse object,
 * so we unwrap the `data` field before returning it to the UI.
 */
const getDownloadManifest = async () => {
  const response = await axiosInstance.get<DownloadManifestDto>(
    `${import.meta.env.VITE_FILES_API_PATH}/binaries/download-manifest`,
  );
  // ServiceResponse<T> returns { data: T, statusCode, message }
  const wrapped = response.data as unknown as { data: DownloadManifestDto };
  return wrapped.data;
};

export { getDownloadManifest };
