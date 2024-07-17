import { useShallow } from "zustand/react/shallow";
import { useFlowsStore } from "../stores/flows-table-store";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/react-toolkit/components/ui";
import { NavLink } from "react-router-dom";
import { useDocumentTitle } from "@/react-toolkit/hooks";

export const FlowsTableHeading: React.FC = () => {
  // Get flows store state and actions
  const { projectName } = useFlowsStore(
    useShallow((state) => ({
      projectName: state.projectName,
    })),
  );

  // Set the document title to "Project Name | flows".
  useDocumentTitle(`${projectName} | Flows`);

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
