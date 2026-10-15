import { useQuery } from "@tanstack/react-query";

import { getUiBuilderProject, getUiBuilderVersions } from "../apis/ui-builder.apis";

export const UI_BUILDER_PROJECT_QUERY_KEY = ["ui-builder-project"] as const;
export const UI_BUILDER_VERSIONS_QUERY_KEY = ["ui-builder-versions"] as const;

/**
 * Fetches a custom UI builder project and its generated versions.
 */
export const useUiBuilderProject = (projectId: string) => {
  const projectQuery = useQuery({
    queryKey: [...UI_BUILDER_PROJECT_QUERY_KEY, projectId],
    queryFn: () => getUiBuilderProject(projectId),
    enabled: Boolean(projectId),
    retry: false,
  });

  const versionsQuery = useQuery({
    queryKey: [...UI_BUILDER_VERSIONS_QUERY_KEY, projectId],
    queryFn: () => getUiBuilderVersions(projectId),
    enabled: Boolean(projectId) && projectQuery.isSuccess,
    retry: false,
  });

  return { projectQuery, versionsQuery };
};
