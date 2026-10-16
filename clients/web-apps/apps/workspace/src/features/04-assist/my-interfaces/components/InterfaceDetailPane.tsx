import { Skeleton } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import { Button } from "@avplatform/ui/buttons";
import { ArrowLeft, LayoutTemplate } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { useIsMobile } from "@/hooks/useIsMobile";

import { UI_TYPE_LABEL } from "../constants";
import { useFetchMyInterfaceView } from "../hooks/useFetchMyInterfaceView.hook";

/**
 * Renders the selected published UI builder project as a read-only sandboxed pane.
 */
export const InterfaceDetailPane = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { data, isFetching, isError } = useFetchMyInterfaceView(id);

  const project = data?.data?.project;
  const headVersion = data?.data?.headVersion;
  const html = headVersion?.generatedHtml ?? "";

  if (isFetching) {
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
      </div>

      {isUnavailable ? (
        <div className="flex flex-1 items-center justify-center p-4 text-center text-sm text-muted-foreground">
          This interface is not available. It may have been disabled, unassigned, or unpublished.
        </div>
      ) : (
        // IMPORTANT NOTE: published HTML must only ever run inside a sandbox limited to
        // `allow-scripts`; adding any origin or navigation token would let the generated
        // document reach the workspace origin.
        <div className="flex-1 p-3">
          <iframe
            title={project?.name ?? "Interface"}
            srcDoc={html}
            sandbox="allow-scripts"
            className="h-full w-full rounded-lg border border-slate-200 bg-white"
          />
        </div>
      )}
    </div>
  );
};
