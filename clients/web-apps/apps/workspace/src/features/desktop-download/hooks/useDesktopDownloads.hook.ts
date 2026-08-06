import { useQuery } from "@tanstack/react-query";

import { getDownloadManifest } from "../apis/desktop-download.apis";

export const useDesktopDownloadManifest = () => {
  return useQuery({
    queryKey: ["desktop-download-manifest"],
    queryFn: () => getDownloadManifest(),
    // The manifest changes rarely; avoid refetching on every dialog open.
    staleTime: 60_000,
  });
};
