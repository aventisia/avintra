import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@aventisia/ui/breadcrumb";
import { useDocumentTitle } from "@aventisia/ui/hooks";
import { NavLink } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { usePayloadDataStore } from "../../store/payload-data-store";

export const PayloadTableHeading: React.FC = () => {
  // Get flows store state and actions
  const { queueName } = usePayloadDataStore(
    useShallow((state) => ({
      queueName: state.currentWorkItem?.queueName,
    })),
  );

  // Set the document title to "Project Name | flows".
  useDocumentTitle(`${queueName ?? ""} | Queues`);

  return (
    <h2 className="ml-1 flex w-full items-center truncate text-lg font-medium text-foreground">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <NavLink to="/orchestrator/queues/">Queues</NavLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-64 truncate text-base">
              {queueName}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </h2>
  );
};
