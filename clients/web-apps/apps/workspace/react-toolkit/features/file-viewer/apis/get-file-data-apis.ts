import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}`;

// Plugs into the workspace API that fingerprints secure file URLs and returns a base64 payload.
const getFileDataUsingFileUrl = (credentialId: string, fileUrl: string) => {
  return axiosInstance
    .get<IHttpResponse<string>>(
      `${baseAPIURL}/file/data-uri?credentialId=${credentialId}&fileUrl=${fileUrl}`,
    )
    .then((res) => res.data);
};

export { getFileDataUsingFileUrl };
