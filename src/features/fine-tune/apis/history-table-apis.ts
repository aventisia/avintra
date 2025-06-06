import {
    IHttpResponse,
  } from "@aventisia/ui/dtos";
  
  import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { FineTuneTableDTO } from "../dtos/fine-tune-table-dto";
  
  

const baseAPIURL: string = `${import.meta.env.VITE_AI_STUDIO_API_URL}`;
  
  /**
   * Retrieves all fine tune records
   */
  const getHistoryRecords = (modelId: string, modelName: string) => {
    return axiosInstance
      .get<IHttpResponse<FineTuneTableDTO[]>>(`${baseAPIURL}/${modelName}/fine-tuning/histories/${modelId}`)
      .then((res) => res.data);
  };


  export {getHistoryRecords}