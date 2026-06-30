import { IHttpResponse } from "@aventisia/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";

import { ExecutionSettings } from "../types/setting-types";

/**
 * Updates flow's setting like maxExecutionTimeInMinutes
 * @param payload Dto containing ExecutionSettings
 * @returns True if update job is successful, else false
 */
const updateFlowVersionSetting = ({
  payload,
  versionId,
}: {
  versionId: string;
  payload: ExecutionSettings;
}) => {
  return axiosInstance
    .put<
      IHttpResponse<boolean>
    >(`${import.meta.env.VITE_WORKSPACE_API_PATH}/flow-version/${versionId}/settings`, payload)
    .then((res) => res.data);
};

export { updateFlowVersionSetting };
