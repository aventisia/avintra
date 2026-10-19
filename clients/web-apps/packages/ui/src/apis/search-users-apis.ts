import type { IHttpResponse } from "@/ui/dtos";
import { axiosInstance } from "@/ui/lib/axios-instance";
import type { SearchedUser } from "@/ui/types";

/** Feature picker item keyed by the user id. */
type UserSelectItem = {
  id: string;

  userName: string;

  firstName: string;

  lastName: string;

  avatarSrc?: string | null;
};

/**
 * Searches tenant users.
 *
 * @param query - Search keyword for the user name or username.
 * @param includeCurrentUser - Whether to include the current user in the results.
 * @param onlyCurrentSpace - When true, restrict results to active members of the current space; otherwise search tenant-wide.
 * @returns Service response containing matching users.
 */
const searchUsers = (
  query: string = "",
  includeCurrentUser: boolean = false,
  onlyCurrentSpace: boolean = false,
) => {
  return axiosInstance
    .get<IHttpResponse<SearchedUser[]>>(`${import.meta.env.VITE_ACCOUNTS_API_PATH}/search/user`, {
      params: {
        query,
        includeCurrentUser,
        onlyCurrentSpace,
      },
    })
    .then((res) => res.data);
};

/**
 * Adapts a shared user search item to a feature item keyed by id.
 *
 * @param user - Shared user search item from the search API.
 * @returns Feature item with the search item fields exposed as-is.
 */
const toUserSelectItem = (user: SearchedUser): UserSelectItem => ({
  id: user.id,
  userName: user.userName,
  firstName: user.firstName,
  lastName: user.lastName,
  avatarSrc: user.avatarSrc,
});

export { searchUsers, toUserSelectItem };
