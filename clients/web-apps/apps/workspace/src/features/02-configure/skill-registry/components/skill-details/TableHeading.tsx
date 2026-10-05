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

import { TABLE_HEADING } from "../../constants";

// TODO: This component should be part of data-table components
export const TableHeading = ({ skillName = "Skill Details" }: { skillName?: string }) => {
  useDocumentTitle(`${skillName} - ${TABLE_HEADING}`);
  return (
    <h2 className="ml-1 flex w-full items-center truncate text-lg font-medium text-foreground">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <NavLink to="/configure/skill-registry">{TABLE_HEADING}</NavLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-64 truncate capitalize">{skillName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </h2>
  );
};
