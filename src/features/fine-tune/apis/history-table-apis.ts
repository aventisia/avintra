import {
    IHttpResponse,
  } from "@aventisia/ui/dtos";
  
  import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { HistoryTableDTO } from "../dtos/history-table-dto";
  
  

const baseAPIURL: string = `${import.meta.env.VITE_AI_STUDIO_API_URL}`;
  
  /**
   * Retrieves all fine tune history records
   */
  const getHistoryRecords = (modelId: string, modelName: string) => {
    return axiosInstance
      .get<IHttpResponse<HistoryTableDTO[]>>(`${baseAPIURL}/${modelName}/fine-tuning/histories/${modelId}`)
      .then((res) => res.data);
  };


  export {getHistoryRecords}