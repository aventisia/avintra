import {
  ScrollArea,
} from "@/react-toolkit/components/ui";
import { FPNoContentMessage } from "./FPNoContentMessage";
import { FPSkeleton } from "./FPSkeleton";
import { useFetchFlows } from "../../hooks/useFetchFlows";

/**
 * Renders the content of the Flows popover component.
 */
export const FlowsPopoverContent = () => {
  // Fetch flows data
  const { data, isLoading } = useFetchFlows();

  // Return the component
  return (
    <>
      {/* Load skeleton only when popover opens for the first time */}
      {isLoading ? (
        <FPSkeleton />
      ) : (
        <>
          {data?.data?.length === 0 ? (
            <FPNoContentMessage />
          ) : (
            <ScrollArea className="grow">
              <div className="space-y-4 pb-4 pt-0.5">
                {/* Flows list */}
                {data?.data?.map((flow) => (
                  <div key={flow.id}>{flow.name}</div>
                ))}
              </div>
            </ScrollArea>
          )}
        </>
      )}
    </>
  );
};
