import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { IHttpResponse } from "@aventisia/ui/dtos";
import { ISelectOption } from "@aventisia/ui/types";

const getProviderModels = (provider: string, credentialId: string) => {
  return axiosInstance
    .get<IHttpResponse<ISelectOption[]>>(
      `${import.meta.env.VITE_WORC_API_PATH}/llm-provider/models/select-option?providerType=${provider}&credentialId=
${credentialId}`,
    )
    .then((res) => res.data);
};

export { getProviderModels };
