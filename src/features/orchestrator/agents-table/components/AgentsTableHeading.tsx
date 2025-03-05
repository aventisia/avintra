import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/react-toolkit/ui/breadcrumb";
import { NavLink } from "react-router-dom";

export const AgentsTableHeading: React.FC = () => {
  // // Get agents store state and actions
  // const { projectName } = useAgentsTableStore(
  //   useShallow((state) => ({
  //     projectName: state.projectName,
  //   })),
  // );

  // Set the document title to "Project Name | agents".
  // useDocumentTitle(`${projectName} | Agents`);

  return (
    <h2 className="ml-1 flex w-full items-center truncate text-lg font-medium text-foreground">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <NavLink to="/orchastrator/agent">Agengts</NavLink>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-64 truncate text-base">
              {"Machine Name"}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </h2>
  );
};
