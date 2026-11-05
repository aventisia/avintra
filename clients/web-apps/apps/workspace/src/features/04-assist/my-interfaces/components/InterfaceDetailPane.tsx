import { Skeleton } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import {
  UiBuilderCalculationsButton,
  UiBuilderHostFrame,
  createUiBuilderDataRequester,
  fetchUiBuilderAssetMap,
  useUiBuilderCalculations,
} from "@avplatform/ui/ui-builder-host";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, LayoutTemplate } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useIsMobile } from "@/hooks/useIsMobile";
import { axiosInstance } from "@/react-toolkit/lib/axios-instance";
import { getSpaceHeaders } from "@/utils/space-headers";

import { UI_TYPE_LABEL } from "../constants";
import { useFetchMyInterfaceView } from "../hooks/useFetchMyInterfaceView.hook";

/**
 * Renders the selected published UI builder project as a read-only sandboxed pane.
 */
export const InterfaceDetailPane = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { data, isLoading, isError } = useFetchMyInterfaceView(id);

  const project = data?.data?.project;
  const headVersion = data?.data?.headVersion;
  const html = headVersion?.generatedHtml ?? "";
  const calculations = useUiBuilderCalculations();
  const resetCalculations = calculations.reset;

  useEffect(() => resetCalculations(), [id, headVersion?.versionNumber, resetCalculations]);

  const assetsQuery = useQuery({
    queryKey: ["ui-builder-view-assets", id],
    queryFn: () =>
      fetchUiBuilderAssetMap({
        http: axiosInstance,
        apiBaseUrl: import.meta.env.VITE_WORKSPACE_API_PATH,
        projectId: id,
        getHeaders: getSpaceHeaders,
      }),
    enabled: Boolean(id),
    staleTime: 5 * 60_000,
  });

  const requestData = useMemo(
    () =>
      createUiBuilderDataRequester({
        http: axiosInstance,
        apiBaseUrl: import.meta.env.VITE_WORKSPACE_API_PATH,
        projectId: id,
        getHeaders: getSpaceHeaders,
      }),
    [id],
  );

  if (isLoading || assetsQuery.isLoading) {
    return (
      <div className="flex h-full w-full flex-col">
        <div className="flex h-16 min-h-16 max-h-16 items-center gap-3 border-b px-3">
          <Skeleton className="h-8 w-8 rounded-lg bg-accent" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="flex-1 p-3">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      </div>
    );
  }

  const isUnavailable = isError || !project || !html;

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-16 min-h-16 max-h-16 items-center gap-3 border-b px-3">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon7"
            className="mr-1"
            onClick={() => navigate("/assist/user-interfaces")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-50 to-accent text-primary ring-1 ring-primary-100">
          <LayoutTemplate className="h-4 w-4" />
        </div>

        <h1 className="truncate text-sm font-semibold capitalize">
          {project?.name ?? "Interface"}
        </h1>

        {headVersion && (
          <Badge className="shrink-0 rounded-full bg-slate-200 px-2 py-0 text-2xs font-medium text-secondary">
            v{headVersion.versionNumber}
          </Badge>
        )}

        <Badge
          variant="outline"
          className="shrink-0 rounded-full border-primary-100 bg-primary-50 py-0.5 text-primary"
        >
          {UI_TYPE_LABEL}
        </Badge>

        <UiBuilderCalculationsButton sections={calculations.sections} className="ml-auto" />
      </div>

      {isUnavailable ? (
        <div className="flex flex-1 items-center justify-center p-4 text-center text-sm text-muted-foreground">
          This interface is not available. It may have been disabled, unassigned, or unpublished.
        </div>
      ) : (
        <div className="flex-1 p-3">
          <UiBuilderHostFrame
            html={html}
            title={project?.name ?? "Interface"}
            connections={project?.dataConnections ?? []}
            onDataRequest={requestData}
            onQueryResult={calculations.record}
            assets={assetsQuery.data}
            className="h-full w-full rounded-lg border border-slate-200 bg-white"
          />
        </div>
      )}
    </div>
  );
};
