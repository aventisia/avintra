import { Badge } from "@avplatform/ui/badge";
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
import { useState } from "react";
import { NavLink, useParams, useSearchParams } from "react-router-dom";

import { getToolById, setToolActiveState, testToolDirectly } from "../../apis/tools.apis";
import { DATA_QUERY_KEY } from "../../constants/tools-table.constants";
import { getToolIcon } from "../../constants/tool-icon-mapper";
import { TestToolDto, TestToolResponseDto } from "../../dtos";
import { ComponentTypeEnum } from "../../enums/component-type-enum";
import { ToolAuthenticationTypeEnum } from "../../enums/tool-authentication-type-enum";
import { getToolDisplayName } from "../../utils/tool-name-formatter";
import { OperationList } from "./OperationList";
import { ToolPlaygroundSection } from "./ToolPlaygroundSection";

const TABLE_HEADING = "Tools";
const DETAIL_QUERY_KEY = "tool";

const authLabels: Record<string, string> = {
  [ToolAuthenticationTypeEnum.None]: "None",
  [ToolAuthenticationTypeEnum.ApiKeyHeader]: "API Key (Header)",
  [ToolAuthenticationTypeEnum.ApiKeyQuery]: "API Key (Query)",
  [ToolAuthenticationTypeEnum.Bearer]: "Bearer Token",
  [ToolAuthenticationTypeEnum.Basic]: "Basic Authentication",
};

const metadataRows = (tool: {
  description?: string;
  baseUrl?: string;
  authenticationType?: string;
  credentialName?: string;
  isActive?: boolean;
  isVerified?: boolean;
  isDisabled?: boolean;
  isTenantWideAccess?: boolean;
  createdBy?: string;
  createdOn?: string;
  lastModifiedBy?: string;
  lastModifiedOn?: string;
}) => [
  {
    label: "Description",
    value: tool.description || "-",
  },
  {
    label: "Base URL",
    value: tool.baseUrl || "-",
  },
  {
    label: "Authentication",
    value: authLabels[tool.authenticationType ?? ""] || tool.authenticationType || "None",
  },
  {
    label: "Credential",
    value: tool.credentialName || "-",
  },
  {
    label: "Status",
    value: tool.isActive ? "Active" : "Inactive",
    badge: tool.isActive
      ? tool.isVerified
        ? "Verified"
        : "Not verified"
      : tool.isVerified
        ? "Verified"
        : "Not verified",
  },
  {
    label: "Verified",
    value: tool.isVerified ? "Yes" : "No",
  },
  {
    label: "Tenant-wide access",
    value: tool.isTenantWideAccess ? "Yes" : "No",
  },
  {
    label: "Created by",
    value: tool.createdBy || "-",
  },
  {
    label: "Created on",
    value: tool.createdOn ? new Date(tool.createdOn).toLocaleString() : "-",
  },
  {
    label: "Last modified by",
    value: tool.lastModifiedBy || "-",
  },
  {
    label: "Last modified on",
    value: tool.lastModifiedOn ? new Date(tool.lastModifiedOn).toLocaleString() : "-",
  },
];

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

  const [playgroundOperation, setPlaygroundOperation] = useState("");
  const [playgroundParams, setPlaygroundParams] = useState("{}");
  const [playgroundResponse, setPlaygroundResponse] = useState<TestToolResponseDto | null>(null);

  const testMutation = useMutation({
    mutationFn: (dto: TestToolDto) => testToolDirectly(dto),
    onSuccess: (response) => {
      setPlaygroundResponse(response);
    },
    onError: (error) => {
      toast.error((error as Error).message || "Test call failed");
    },
  });

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

  const handleTest = () => {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(playgroundParams);
    } catch {
      toast.error("Parameters must be valid JSON");
      return;
    }
    testMutation.mutate({
      operationId: playgroundOperation,
      parameters: parsed,
      baseUrl: tool?.baseUrl ?? "",
      openApiSpec: tool?.openApiSpec,
      credentialName: tool?.credentialName,
    });
  };

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

  const rows = metadataRows(tool);
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

      {isPlatformTool ? (
        <div className="grid grid-cols-1 h-[calc(100vh-2.7*var(--header-height))] gap-3">
          <div className="space-y-4">
            {/* Platform Tool Header: Icon, Name, and Description */}
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
      ) : (
        <div className="grid grid-cols-9 h-[calc(100vh-2.7*var(--header-height))] gap-3">
          <div className="col-span-6 space-y-4">
            {/* Metadata Section */}
            <div className="rounded-lg border bg-background px-5 py-3.5">
              <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                {rows.map((row) => (
                  <div key={row.label} className="flex flex-col gap-0.5 rounded-md">
                    <span className="text-2xs uppercase tracking-wide text-muted-foreground">
                      {row.label}
                    </span>
                    <div className="flex gap-2 items-center">
                      <span className="text-sm font-medium break-all">{row.value}</span>
                      {row.badge && (
                        <Badge variant="secondary" className="h-[1.1rem] px-1.5">
                          {row.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Operations Section */}
            <div className="rounded-lg border bg-background px-5 py-3.5">
              <OperationList tool={tool} showTitle />
            </div>
          </div>

          {/* Playground Section */}
          <div className="col-span-3 border bg-background rounded-lg flex flex-col">
            <ToolPlaygroundSection
              tool={tool}
              selectedOperation={playgroundOperation}
              setSelectedOperation={setPlaygroundOperation}
              parameters={playgroundParams}
              setParameters={setPlaygroundParams}
              onTest={handleTest}
              isTesting={testMutation.isPending}
              lastResponse={playgroundResponse}
            />
          </div>
        </div>
      )}
    </div>
  );
};
