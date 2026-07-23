import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@avplatform/ui/breadcrumb";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { NavLink } from "react-router-dom";

export const PayloadTableHeading = ({ queueName }: { queueName: string }) => {
  useDocumentTitle(`${queueName} - Queues`);
  return (
    <h2 className="ml-1 flex w-full items-center truncate text-lg font-medium text-foreground">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <NavLink to="/configure/queues/">Queues</NavLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-64 truncate capitalize">{queueName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </h2>
  );
};
