import { Switch } from "@avplatform/ui";
import { Badge } from "@avplatform/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@avplatform/ui/breadcrumb";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { useQuery } from "@tanstack/react-query";
import { NavLink, useParams, useSearchParams } from "react-router-dom";

import { getToolById } from "../../apis/tools.apis";
import { DETAIL_DATA_QUERY_KEY } from "../../constants/tools-table.constants";
import { ComponentTypeEnum } from "../../enums/component-type-enum";
import { useToggleLibraryTool } from "../../hooks/useToggleLibraryTool.hook";
import { getToolDisplayName } from "../../utils/tool-name-formatter";
import { ToolIcon } from "../ToolIcon";
import { OperationList } from "./OperationList";

const TABLE_HEADING = "Tools";

export const ToolDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const toolName = searchParams.get("tool") ?? "Tool Details";

  useDocumentTitle(`${toolName} - ${TABLE_HEADING}`);

  const { canToggle, toggle } = useToggleLibraryTool();

  const { data, isLoading } = useQuery({
    queryKey: [...DETAIL_DATA_QUERY_KEY, id],
    queryFn: () => getToolById(id ?? ""),
    enabled: !!id,
  });

  const tool = data?.data;
  const isLibraryTool = tool?.type === ComponentTypeEnum.Platform;

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
      </div>

      <div className="grid h-[calc(100vh-2.7*var(--header-height))] grid-cols-1 gap-3">
        <div className="space-y-4">
          <div className="rounded-lg border bg-background px-5 py-3.5">
            <div className="flex items-center  gap-4">
              <ToolIcon
                name={tool.name}
                iconUrl={tool.iconUrl}
                className="h-12 w-12 flex-shrink-0 object-contain"
              />
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold">{getToolDisplayName(tool.name)}</h1>
                  {isLibraryTool && (
                    <>
                      <Badge variant={tool.isActive ? "default" : "secondary"}>
                        {tool.isActive ? "Enabled" : "Disabled"}
                      </Badge>
                      {canToggle && (
                        <Switch
                          checked={Boolean(tool.isActive)}
                          onCheckedChange={(checked) =>
                            toggle({ id: tool.id ?? "", isEnabled: checked })
                          }
                        />
                      )}
                    </>
                  )}
                </div>
                {tool.description && (
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-background px-5 py-3.5">
            <OperationList tool={tool} showTitle />
          </div>
        </div>
      </div>
    </div>
  );
};
