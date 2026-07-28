import { ScrollArea } from "@avplatform/ui/scroll";
import { useFetchFlowComments } from "../../hooks/useFetchFlowComments";
import { FlowCommentItem } from "../flow-comment-item";
import { FCPNoContentMessage } from "./FCPNoContentMessage";
import { FCPSkeleton } from "./FCPSkeleton";

/**
 * Renders the content of the Flow Comments component.
 */
export const FlowCommentsPopoverContent = () => {
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
