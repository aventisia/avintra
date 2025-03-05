import { useDocumentTitle } from "@/react-toolkit/hooks/useDocumentTitle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/react-toolkit/ui/breadcrumb";
import { NavLink } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { useFlowsTableStore } from "../stores/flows-table-store";

export const FlowsTableHeading: React.FC = () => {
  // Get agents store state and actions
  const { projectName } = useFlowsTableStore(
    useShallow((state) => ({
      projectName: state.projectName,
    })),
  );

  // Set the document title to "Project Name | Agents".
  useDocumentTitle(`${projectName} | Agents`);

  return (
    <h2 className="ml-1 flex w-full items-center truncate text-lg font-medium text-foreground">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <NavLink to="/projects/">Projects</NavLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-64 truncate text-base">
              {projectName}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </h2>
  );
};
