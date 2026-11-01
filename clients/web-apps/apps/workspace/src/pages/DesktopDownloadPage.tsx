import { DataTableSkeleton } from "@avplatform/ui/data-table";
import { Suspense, lazy } from "react";

const DesktopDownload = lazy(() =>
  import("@/features/desktop-download/components/DesktopDownloadPage").then((module) => ({
    default: module.DesktopDownloadPage,
  })),
);

export const DesktopDownloadPage = () => (
  <Suspense fallback={<DataTableSkeleton />}>
    <DesktopDownload />
  </Suspense>
);
