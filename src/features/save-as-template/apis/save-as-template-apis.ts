import { IHttpResponse } from "@aventisia/ui/dtos";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { SaveAsTemplateDto } from "../dto/save-as-template";

const baseAPIURL: string = `${import.meta.env.VITE_WORC_API_URL}/flow-template`;

/**
 * Save as template.
 */
const postSaveAsTemplate = (templateData: SaveAsTemplateDto) => {
  return axiosInstance
    .post<
      IHttpResponse<SaveAsTemplateDto>
    >(`${baseAPIURL}/publish`, templateData)
    .then((res) => res.data);
};

export { postSaveAsTemplate };
