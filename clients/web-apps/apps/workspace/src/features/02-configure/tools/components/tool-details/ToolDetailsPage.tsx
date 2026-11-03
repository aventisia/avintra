import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@avplatform/ui/breadcrumb";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { RecordSheetLoading, RecordSheetUnavailable } from "@avplatform/ui/record-sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@avplatform/ui/tabs";
import { WrenchIcon } from "@phosphor-icons/react";
import { NavLink, useParams, useSearchParams } from "react-router-dom";

import { TABLE_HEADING } from "../../constants/tools-table.constants";
import { useFetchToolDetails } from "../../hooks/useFetchToolDetails.hook";
import { useTableTab } from "../../hooks/useTableTab.hook";
import { getToolsListPath } from "../../utils/tool-details-path.util";
import { getToolDisplayName } from "../../utils/tool-name-formatter";
import { normalizeToolOperations } from "../../utils/tool-operations.util";
import { OperationList } from "./OperationList";
import { ToolDetailsFacts } from "./ToolDetailsFacts";
import { ToolDetailsHero } from "./ToolDetailsHero";
import { ToolSpecification } from "./ToolSpecification";

/**
 * Tool page: banner, operations and specification tabs, and a details sidebar.
 */
export const ToolDetailsPage = () => {
  const { id = "" } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { isPlatformTab } = useTableTab();
  const { tool, isLoading } = useFetchToolDetails(id);

  const toolName = getToolDisplayName(tool?.name ?? searchParams.get("tool") ?? "") || "Tool";
  const toolsPath = getToolsListPath(isPlatformTab);
  useDocumentTitle(`${toolName} - ${TABLE_HEADING}`);

  const operations = normalizeToolOperations(tool);

  return (
    <div className="space-y-4 pb-4 pt-[17px]">
      <h2 className="ml-1 flex w-full items-center truncate text-lg font-medium text-foreground">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <NavLink to={toolsPath}>{TABLE_HEADING}</NavLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-64 truncate">{toolName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </h2>

      {isLoading && <RecordSheetLoading label="Loading tool details..." />}
      {!isLoading && !tool && <RecordSheetUnavailable Icon={WrenchIcon} recordLabel="Tool" />}
      {tool && (
        <>
          <ToolDetailsHero tool={tool} operationCount={operations.length} />
          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <Tabs defaultValue="operations" className="min-w-0">
              <TabsList>
                <TabsTrigger value="operations">
                  Operations
                  <span className="rounded-sm bg-sunken px-1.5 font-mono text-[11px] tabular-nums text-muted-foreground ring-1 ring-inset ring-line">
                    {operations.length}
                  </span>
                </TabsTrigger>
                {tool.openApiSpec && <TabsTrigger value="specification">Specification</TabsTrigger>}
              </TabsList>
              <TabsContent value="operations" className="mt-3">
                <OperationList operations={operations} />
              </TabsContent>
              {tool.openApiSpec && (
                <TabsContent value="specification" className="mt-3">
                  <ToolSpecification spec={tool.openApiSpec} />
                </TabsContent>
              )}
            </Tabs>
            <div className="lg:sticky lg:top-4 lg:mt-12">
              <ToolDetailsFacts tool={tool} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
