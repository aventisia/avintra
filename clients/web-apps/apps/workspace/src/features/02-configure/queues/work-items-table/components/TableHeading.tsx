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

interface PayloadTableHeadingProps {
  queueName: string;
  /**
   * Originating queues tab (personal/shared). When present, the "Queues"
   * breadcrumb returns to that tab instead of the default personal list.
   */
  tab?: string | null;
}

export const PayloadTableHeading = ({ queueName, tab }: PayloadTableHeadingProps) => {
  useDocumentTitle(`${queueName} - Queues`);
  return (
    <h2 className="ml-1 flex w-full items-center truncate text-lg font-medium text-foreground">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <NavLink to={`/configure/queues/${tab ? `?tab=${tab}` : ""}`}>Queues</NavLink>
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
