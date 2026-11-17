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

import { TABLE_HEADING, TABLE_TAB_QUERY_PARAM } from "../../constants";
import { useTableTab } from "../../hooks/useTableTab.hook";

// TODO: This component should be part of data-table components
export const TableHeading = ({ skillName = "Skill Details" }: { skillName?: string }) => {
  useDocumentTitle(`${skillName} - ${TABLE_HEADING}`);
  const { isPlatformTab } = useTableTab();
  const listPath = isPlatformTab
    ? `/configure/skill-registry?${TABLE_TAB_QUERY_PARAM}=platform`
    : "/configure/skill-registry";
  return (
    <h2 className="ml-1 flex w-full items-center truncate text-lg font-medium text-ink">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <NavLink to={listPath}>{TABLE_HEADING}</NavLink>
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
