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

import { TABLE_HEADING } from "../../constants";

// TODO: This component should be part of data-table components
export const TableHeading = ({
  kbName = "KB Details",
}: {
  kbName?: string;
}) => {
  useDocumentTitle(`${kbName} - ${TABLE_HEADING}`);
  return (
    <h2 className="ml-1 flex w-full items-center truncate text-lg font-medium text-foreground">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <NavLink to="/orchestrator/knowledge-base">
                {TABLE_HEADING}
              </NavLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-64 truncate capitalize">
              {kbName}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </h2>
  );
};
