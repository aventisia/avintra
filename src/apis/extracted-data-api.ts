import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { IHttpResponse } from "@aventisia/ui/dtos";
import { ExtractUpdateRequestDto } from "@/dtos/extract-update-request-dto";

const baseAPIURL: string = `${import.meta.env.VITE_AI_STUDIO_API_URL}/extracted-data`;

/**
 * Updates Extracted data.
 */
const updateExtractedData = (data: ExtractUpdateRequestDto) => {
  return axiosInstance
    .put<IHttpResponse<ExtractUpdateRequestDto>>(`${baseAPIURL}`, data)
    .then((res) => res.data);
};


export { updateExtractedData }