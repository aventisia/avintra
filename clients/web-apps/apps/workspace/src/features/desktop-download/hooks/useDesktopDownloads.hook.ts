import { useQuery } from "@tanstack/react-query";

import { getDownloadManifest } from "../apis/desktop-download.apis";

export const useDesktopDownloadManifest = () => {
  return useQuery({
    queryKey: ["desktop-download-manifest"],
    queryFn: () => getDownloadManifest(),
  });
};
