import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@aventisia/ui/breadcrumb";
import { useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useFetchJobDetails } from "../../hooks/useFetchJobDetails";
import { useExecutionLogStore } from "../../stores/execution-log-store";
import { ExecutionNode } from "../../types/execution-types";

import { NodeDetail } from "./NodeDetails";
import { NodeList } from "./NodeList";

const ExecutionLogs = () => {
  // Get job id form url
  const { id } = useParams();

  // fetch jobs details data
  const { data } = useFetchJobDetails(id);

  const { executions, selectedNodeId, setExecutions, setNodeId } =
    useExecutionLogStore(
      useShallow((state) => ({
        executions: state.executions,
        selectedNodeId: state.selectedNodeId,
        setNodeId: state.setNodeId,
        setExecutions: state.setExecutions,
      })),
    );

  // Selected Node data
  const node = executions?.find(
    (n) => (n?.uniqueNodeId || n.nodeId) === selectedNodeId,
  );

  useEffect(() => {
    if (data?.data?.nodeExecutionLogs) {
      const logs = JSON.parse(
        data?.data?.nodeExecutionLogs ?? "[]",
      ) as unknown as ExecutionNode[];

      const dataWithUniqueId = logs?.map((node) => {
        return { ...node, uniqueNodeId: window.crypto.randomUUID() };
      });

      setExecutions(dataWithUniqueId);

      if (dataWithUniqueId?.length)
        setNodeId(dataWithUniqueId[0]?.uniqueNodeId);
    }

    return () => {
      setExecutions([]);
      setNodeId("");
    };
  }, [data?.data?.nodeExecutionLogs, setExecutions, setNodeId]);

  return (
    <>
      <div className="space-y-4 pb-4 pt-[17px]">
        <h2 className="ml-1 flex w-full items-center truncate text-lg font-medium text-foreground">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <NavLink to="/orchestrator/jobs">Jobs</NavLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-96 truncate capitalize">
                  {data?.data.name} - Execution Logs
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </h2>
        <div
          className={`grid h-[calc(100vh-4.5rem-var(--header-height)-var(--header-padding))] grid-cols-7 divide-x rounded-lg border bg-white`}
        >
          <div className="col-span-3">
            <NodeList nodes={executions} />
          </div>
          <div className="col-span-4">
            <NodeDetail node={node} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ExecutionLogs;
