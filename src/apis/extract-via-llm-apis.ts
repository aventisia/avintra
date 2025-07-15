import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { ExtractRequestDto } from "../features/pdf-previewer/dtos/extract-request-dto";
import { ExtractResponseDto } from "../features/pdf-previewer/dtos/extract-response-dto";

const baseAPIURL: string = `${import.meta.env.VITE_AISTUDIO_API_URL}`;

/**
 * Extract data fields from a PDF file via LLM.
 */
const extractViaLLM = (postObj: ExtractRequestDto, modelType: string) => {
  return axiosInstance
    .post<
      IHttpResponse<ExtractResponseDto>
    >(`${baseAPIURL}/${modelType}/extract-via-llm`, postObj)
    .then((res) => res.data);
};

export { extractViaLLM };
