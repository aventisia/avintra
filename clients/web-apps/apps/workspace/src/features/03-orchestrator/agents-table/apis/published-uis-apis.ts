import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { PublishedUiDto, PublishedUiViewDto } from "../dtos/published-ui-dto";

const uiBuilderApiUrl: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/ui-builder`;

/**
 * Retrieves all published custom UI builder projects.
 */
export const getPublishedUis = () => {
  return axiosInstance
    .get<IHttpResponse<PublishedUiDto[]>>(`${uiBuilderApiUrl}/published`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Retrieves a published UI builder project and its pinned published version for the orchestrator preview.
 */
export const getOmUiView = (id: string) => {
  return axiosInstance
    .get<IHttpResponse<PublishedUiViewDto>>(`${uiBuilderApiUrl}/published/${id}/om-view`, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Disables or enables a published UI builder project.
 */
export const updatePublishedUiStatus = ({
  id,
  isDisabled,
}: {
  id: string;
  isDisabled: boolean;
}) => {
  return axiosInstance
    .put<IHttpResponse<PublishedUiDto>>(
      `${uiBuilderApiUrl}/${id}/status`,
      { isDisabled },
      { headers: getSpaceHeaders() },
    )
    .then((res) => res.data);
};
