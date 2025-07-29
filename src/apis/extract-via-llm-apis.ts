import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";

import { ExtractRequestDto } from "../features/pdf-previewer/dtos/extract-request-dto";
import { ExtractedDataResponseDto } from "../features/pdf-previewer/dtos/extract-response-dto";

const baseAPIURL: string = `${import.meta.env.VITE_AISTUDIO_API_URL}`;

/**
 * Extract data fields from a PDF file via LLM.
 */
const extractViaLLM = (postObj: ExtractRequestDto, numberOfTasks: number = 1) => {
  return axiosInstance
    .post<
      IHttpResponse<ExtractedDataResponseDto>
    >(`${baseAPIURL}/inferencing-model/execute`, postObj, {
      timeout: numberOfTasks * 60000,
    })
    .then((res) => res.data);
};

export { extractViaLLM };
