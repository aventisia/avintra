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
import { useModelsTableStore } from "../stores/models-table-store";

export const ModelsTableHeading: React.FC = () => {
  // Get models store state and actions
  const { projectName } = useModelsTableStore(
    useShallow((state) => ({
      projectName: state.projectName,
    })),
  );

  // Set the document title to "Project Name | models".
  useDocumentTitle(`${projectName} | Models`);

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
