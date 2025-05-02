import { IHttpResponse } from "@aventisia/ui/dtos";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { ExtractRequestDto } from "../dtos/extract-request-dto";
import { ExtractResponseDto } from "../dtos/extract-response-dto";

const baseAPIURL: string = `${import.meta.env.VITE_AI_STUDIO_API_URL}/extract-via-llm`;

/**
 * Extract data fields from a PDF file via LLM.
 */
const extractViaLLM = (postObj: ExtractRequestDto) => {
  return axiosInstance
    .post<IHttpResponse<ExtractResponseDto>>(`${baseAPIURL}`, postObj)
    .then((res) => res.data);
};

export {
  extractViaLLM
};

