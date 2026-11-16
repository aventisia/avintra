import { TableCNSkeleton } from "@avplatform/ui/table-cn";
import { Suspense, lazy } from "react";

const DesktopDownload = lazy(() =>
  import("@/features/desktop-download/components/DesktopDownloadPage").then((module) => ({
    default: module.DesktopDownloadPage,
  })),
);

export const DesktopDownloadPage = () => (
  <Suspense fallback={<TableCNSkeleton />}>
    <DesktopDownload />
  </Suspense>
);
