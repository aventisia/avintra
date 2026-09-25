import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@avplatform/ui/breadcrumb";
import { Button } from "@avplatform/ui/buttons";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { toast } from "@avplatform/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NavLink, useParams, useSearchParams } from "react-router-dom";

import { getToolById, setToolActiveState } from "../../apis/tools.apis";
import { getToolIcon } from "../../constants/tool-icon-mapper";
import { DATA_QUERY_KEY } from "../../constants/tools-table.constants";
import { ComponentTypeEnum } from "../../enums/component-type-enum";
import { getToolDisplayName } from "../../utils/tool-name-formatter";
import { OperationList } from "./OperationList";

const TABLE_HEADING = "Tools";
const DETAIL_QUERY_KEY = "tool";

export const ToolDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const toolName = searchParams.get("tool") ?? "Tool Details";
  const queryClient = useQueryClient();

  useDocumentTitle(`${toolName} - ${TABLE_HEADING}`);

  const { data, isLoading } = useQuery({
    queryKey: [DETAIL_QUERY_KEY, id],
    queryFn: () => getToolById(id ?? ""),
    enabled: !!id,
  });

  const tool = data?.data;

  const activeStateMutation = useMutation({
    mutationFn: (isActive: boolean) => setToolActiveState(id ?? "", isActive),
    onSuccess: (_response, isActive) => {
      toast.success(`Tool ${isActive ? "activated" : "deactivated"}.`);
      queryClient.invalidateQueries({ queryKey: [DETAIL_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: DATA_QUERY_KEY });
    },
    onError: (error) => {
      toast.error((error as Error).message || "Failed to update tool active state");
    },
  });

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading...</div>;
  }

  if (!tool) {
    return (
      <div className="space-y-4 p-6">
        <h1 className="text-xl font-semibold">{toolName}</h1>
        <p className="text-sm text-muted-foreground">Tool not found.</p>
      </div>
    );
  }

  const isPlatformTool = tool.type === ComponentTypeEnum.Platform;
  const basePath = import.meta.env.VITE_WORKSPACE_PATH?.replace(/\/$/, "") || "";

  return (
    <div className="space-y-4 h-full pb-4 pt-[17px]">
      <div className="flex items-center justify-between">
        <h2 className="ml-1 flex w-full items-center truncate text-lg font-medium text-foreground">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <NavLink to="/configure/tools">{TABLE_HEADING}</NavLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-64 truncate capitalize">{toolName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </h2>
        <div className="flex items-center gap-2">
          {!isPlatformTool && (
            <Button
              size="sm"
              variant={tool.isActive ? "outline" : "default"}
              disabled={activeStateMutation.isPending}
              onClick={() => activeStateMutation.mutate(!tool.isActive)}
            >
              {activeStateMutation.isPending
                ? tool.isActive
                  ? "Deactivating..."
                  : "Activating..."
                : tool.isActive
                  ? "Deactivate Tool"
                  : "Activate Tool"}
            </Button>
          )}
        </div>
      </div>

      {/* Unified detail layout (same for platform and custom tools): icon
          header card plus the operations list, full width. Custom tools fall
          back to the default-provider icon via getToolIcon. */}
      <div className="grid h-[calc(100vh-2.7*var(--header-height))] grid-cols-1 gap-3">
        <div className="space-y-4">
          {/* Tool header: icon, name, and description */}
          <div className="rounded-lg border bg-background px-5 py-3.5">
            <div className="flex items-center  gap-4">
              <img
                src={basePath + getToolIcon(tool.name)}
                alt={tool.name}
                className="h-12 w-12 flex-shrink-0 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = basePath + "/brand-img/default-provider.svg";
                }}
              />
              <div className="flex flex-col gap-2">
                <h1 className="text-xl font-semibold">{getToolDisplayName(tool.name)}</h1>
                {tool.description && (
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Operations Section */}
          <div className="rounded-lg border bg-background px-5 py-3.5">
            <OperationList tool={tool} showTitle />
          </div>
        </div>
      </div>
    </div>
  );
};
