import { type IHttpResponse } from "@avplatform/ui/dtos";
import { axiosInstance } from "@avplatform/ui/lib";

import { getSpaceHeaders } from "@/utils/space-headers";

import { type UserChatProfileDto } from "../dtos/user-chat-profile.dto";

const baseAPIURL = `${import.meta.env.VITE_WORKSPACE_API_PATH}/assist/chat-profile`;

/** Gets the signed-in user's custom instructions and memory notes. */
export const getUserChatProfile = () =>
  axiosInstance
    .get<IHttpResponse<UserChatProfileDto>>(baseAPIURL, { headers: getSpaceHeaders() })
    .then((res) => res.data);

/** Saves the signed-in user's custom instructions and memory notes. */
export const saveUserChatProfile = (profile: UserChatProfileDto) =>
  axiosInstance
    .put<IHttpResponse<UserChatProfileDto>>(baseAPIURL, profile, { headers: getSpaceHeaders() })
    .then((res) => res.data);
