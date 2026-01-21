import { ExtractUpdateRequestDto } from "@/dtos/extract-update-request-dto";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

const baseAPIURL: string = `${import.meta.env.VITE_AISTUDIO_API_PATH}/extracted-data`;

/**
 * Updates Extracted data.
 */
const updateExtractedData = (data: ExtractUpdateRequestDto) => {
  return axiosInstance
    .put<IHttpResponse<ExtractUpdateRequestDto>>(`${baseAPIURL}`, data)
    .then((res) => res.data);
};

export { updateExtractedData };
