import { axiosInstance } from "@avplatform/ui/lib";
import {
  type UiBuilderDataConnection,
  createUiBuilderDataRequester,
} from "@avplatform/ui/ui-builder-host";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { getStudioSpaceHeaders } from "@/utils/space-headers";

import { getUiBuilderQueue, updateUiBuilderDataConnections } from "../apis/ui-builder.apis";
import { type UiBuilderConnectionContext } from "../constants/ui-builder-data-prompt.constant";
import { type UiBuilderProjectDto } from "../dtos/ui-builder-dto";
import { UI_BUILDER_PROJECT_QUERY_KEY } from "./useUiBuilderProject.hook";

/** Query key prefix for a bound queue's schema. */
export const UI_BUILDER_QUEUE_QUERY_KEY = ["ui-builder-queue"] as const;

/**
 * Exposes a project's data connections, their live queue schemas, the request handler the
 * preview uses, and a mutation that saves the connection list.
 */
export const useUiBuilderDataConnections = (project: UiBuilderProjectDto | undefined) => {
  const queryClient = useQueryClient();
  const projectId = project?.id ?? "";

  const connections = useMemo(() => project?.dataConnections ?? [], [project?.dataConnections]);

  const queueQueries = useQueries({
    queries: connections.map((connection) => ({
      queryKey: [...UI_BUILDER_QUEUE_QUERY_KEY, connection.queueId, connection.envType],
      queryFn: () => getUiBuilderQueue(connection.queueId, connection.envType),
      staleTime: 60_000,
      retry: false,
    })),
  });

  const contexts: UiBuilderConnectionContext[] = connections.map((connection, index) => {
    const queue = queueQueries[index]?.data?.data;
    return {
      connection,
      fields: queue?.inputSchema ?? [],
      statuses: (queue?.statuses ?? []).map((status) => status.name).filter(Boolean),
    };
  });

  const requestData = useMemo(
    () =>
      createUiBuilderDataRequester({
        http: axiosInstance,
        apiBaseUrl: import.meta.env.VITE_WORKSPACE_API_PATH,
        projectId,
        getHeaders: getStudioSpaceHeaders,
      }),
    [projectId],
  );

  const saveMutation = useMutation({
    mutationFn: (next: UiBuilderDataConnection[]) =>
      updateUiBuilderDataConnections(projectId, next),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...UI_BUILDER_PROJECT_QUERY_KEY, projectId] }),
  });

  return {
    connections,
    contexts,
    isSchemaLoading: queueQueries.some((query) => query.isLoading),
    requestData,
    saveMutation,
  };
};
