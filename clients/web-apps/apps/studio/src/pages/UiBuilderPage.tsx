import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { UiBuilderWorkspace, useUiBuilderVersionsStore } from "@/features/ui-builder";

const workspaceHref = `${import.meta.env.VITE_WORKSPACE_PATH}ui-builder`;

/**
 * Renders the custom UI builder page for the project id supplied via the `id` query parameter.
 */
export const UiBuilderPage = () => {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id");
  const setProjectId = useUiBuilderVersionsStore((state) => state.setProjectId);

  useEffect(() => {
    setProjectId(projectId ?? "");
    return () => setProjectId("");
  }, [projectId, setProjectId]);

  if (!projectId) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm font-medium">No UI builder project was specified.</p>
        <a href={workspaceHref} className="text-sm text-primary underline">
          Back to UI Builder projects
        </a>
      </div>
    );
  }

  return <UiBuilderWorkspace key={projectId} projectId={projectId} />;
};
