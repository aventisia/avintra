import { useShallow } from "zustand/react/shallow";

import { useDocumentTitle } from "@aventisia/ui/hooks";

import { useUploadItemsStore } from "../../store/upload-items-store";

export const FlowsTableHeading: React.FC = () => {
  // Get flows store state and actions
  const { queueName } = useUploadItemsStore(
    useShallow((state) => ({
      queueName: state.queueName,
    })),
  );

  // Set the document title to "Project Name | flows".
  useDocumentTitle(`${queueName} | Queues`);

  return (
    <h2 className="ml-1 flex w-full items-center truncate text-lg font-medium text-foreground">
      {/*     
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
              {queueName}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb> */}
    </h2>
  );
};
