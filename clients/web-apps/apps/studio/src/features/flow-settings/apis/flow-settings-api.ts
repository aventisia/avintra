import { IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

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
    .put<IHttpResponse<boolean>>(
      `${import.meta.env.VITE_WORKSPACE_API_PATH}/flow-version/${versionId}/settings`,
      payload,
    )
    .then((res) => res.data);
};

export { updateFlowVersionSetting };
