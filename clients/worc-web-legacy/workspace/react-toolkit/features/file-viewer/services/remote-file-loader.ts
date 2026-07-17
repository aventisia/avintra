import { getFileDataUsingFileUrl } from "../apis/get-file-data-apis";

export interface RemoteFileLoaderParams {
  fileUrl: string;
  credentialId?: string;
  extension: string;
  name: string;
  signal?: AbortSignal;
}

export type RemoteFileLoaderResult = Blob | string | ArrayBuffer | ArrayBufferView;

export type RemoteFileLoader = (params: RemoteFileLoaderParams) => Promise<RemoteFileLoaderResult>;

/**
 * Default loader that always hits the workspace API, returning the base64 payload for a file URL.
 */
export const defaultRemoteFileLoader: RemoteFileLoader = async (params) => {
  const credentialId = params.credentialId ?? "";
  const { data, message } = await getFileDataUsingFileUrl(credentialId, params.fileUrl);

  if (!data) {
    throw new Error(message || "Failed to download file");
  }

  return data;
};
