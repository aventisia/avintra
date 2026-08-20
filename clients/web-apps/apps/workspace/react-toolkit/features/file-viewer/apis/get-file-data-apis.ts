import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}`;

// Plugs into the workspace API that fingerprints secure file URLs and returns a base64 payload.
const getFileDataUsingFileUrl = (credentialName: string, fileUrl: string) => {
  return axiosInstance
    .get<IHttpResponse<string>>(
      `${baseAPIURL}/file/data-uri?credentialName=${credentialName}&fileUrl=${fileUrl}`,
    )
    .then((res) => res.data);
};

export { getFileDataUsingFileUrl };
