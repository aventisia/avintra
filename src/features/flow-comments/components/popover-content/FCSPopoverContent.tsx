import {
  useFetchFlowComments,
  FCSPSkeleton,
  FCSPNoContentMessage,
} from "@/features/flow-comments";
import { ScrollArea } from "@/react-toolkit/components/ui";

/**
 * Renders the content of the Flow Comments component.
 */
export const FCSPopoverContent = () => {
  // Fetch flow comments
  const { data, isLoading } = useFetchFlowComments();

  // Return the component
  return (
    <>
      {/* Load skeleton only when popover opens for the first time */}
      {isLoading ? (
        <FCSPSkeleton />
      ) : (
        <>
          {data?.data?.length === 0 ? (
            <FCSPNoContentMessage />
          ) : (
            <ScrollArea>
              {data?.data?.map((item) => (
                <div key={item.id} className="px-4 py-2">
                  {item.comment}
                </div>
              ))}
            </ScrollArea>
          )}
        </>
      )}
    </>
  );
};
