import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { useFetchFlowComments } from "../../hooks/useFetchFlowComments";
import { FCPNoContentMessage } from "./FCPNoContentMessage";
import { FCPSkeleton } from "./FCPSkeleton";
import { FlowCommentItem } from "./flow-comment-item/FlowCommentItem";

/**
 * Renders the content of the Flow Comments component.
 */
export const FCPopoverContent = () => {
  // Fetch flow comments
  const { data, isLoading } = useFetchFlowComments();

  // Return the component
  return (
    <>
      {/* Load skeleton only when popover opens for the first time */}
      {isLoading ? (
        <FCPSkeleton />
      ) : (
        <>
          {data?.data?.length === 0 ? (
            <FCPNoContentMessage />
          ) : (
            <ScrollArea className="grow">
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
