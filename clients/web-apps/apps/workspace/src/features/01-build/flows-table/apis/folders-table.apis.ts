import { IHttpResponse } from "@avplatform/ui/dtos";

import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { FoldersTableRowDto } from "../dtos/folders-table-row.dto";
import { InsertFolderDto } from "../dtos/insert-folder.dto";
import { UpdateFolderDto } from "../dtos/update-folder.dto";

const baseAPIURL: string = `${import.meta.env.VITE_WORKSPACE_API_PATH}/folder`;

/**
 * Retrieves list of folders.
 */
const getFolders = () => {
  return axiosInstance
    .get<IHttpResponse<FoldersTableRowDto[]>>(`${baseAPIURL}/list`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

/**
 * Inserts a new folder.
 */
const createFolder = (insertFolderDto: InsertFolderDto) => {
  return axiosInstance
    .post<IHttpResponse<FoldersTableRowDto>>(`${baseAPIURL}`, insertFolderDto, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Updates an existing folder.
 */
const updateFolder = (updateFolderDto: UpdateFolderDto) => {
  return axiosInstance
    .put<IHttpResponse<FoldersTableRowDto>>(`${baseAPIURL}`, updateFolderDto, {
      headers: getSpaceHeaders(),
    })
    .then((res) => res.data);
};

/**
 * Deletes an existing folder.
 */
const deleteFolder = (folderId: string) => {
  return axiosInstance
    .delete<IHttpResponse<boolean>>(`${baseAPIURL}/${folderId}`, { headers: getSpaceHeaders() })
    .then((res) => res.data);
};

export { getFolders, createFolder, updateFolder, deleteFolder };
