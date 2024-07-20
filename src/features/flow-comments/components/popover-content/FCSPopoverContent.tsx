import {
  useFetchFlowComments,
  FCSPSkeleton,
  FCSPNoContentMessage,
  FlowCommentItem,
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
              {data?.data?.map((item, index) => (
                <FlowCommentItem key={item.id} index={index} data={item} />
              ))}
            </ScrollArea>
          )}
        </>
      )}
    </>
  );
};
