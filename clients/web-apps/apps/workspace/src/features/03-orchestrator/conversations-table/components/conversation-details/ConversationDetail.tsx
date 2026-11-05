import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@avplatform/ui/breadcrumb";
import { RecordSheetUnavailable } from "@avplatform/ui/record-sheet";
import { ChatCircleDotsIcon } from "@phosphor-icons/react";
import { NavLink, useParams } from "react-router-dom";

import { useCarryParams } from "@/hooks/useForwardQueryParams";

import { useFetchConversationDetails } from "../../hooks/useFetchConversationDetails";
import ChatSection from "./ChatSection";
import ConversationMeta from "./ConversationMeta";

export default function ConversationDetail() {
  // Get conversation id form url
  const { id } = useParams();

  // forward query params
  const withQueryParams = useCarryParams(["from", "to"]);

  // fetch conversations details data
  const { data, isLoading } = useFetchConversationDetails(id);

  return (
    <div className="space-y-4 pb-4 pt-[17px]">
      <h2 className="ml-1 flex w-full items-center truncate text-heading text-ink">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <NavLink to={withQueryParams("/orchestrator/conversations")}>Conversations</NavLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-96 truncate capitalize">
                {data?.data?.title + "..."}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </h2>
      <div className="h-[calc(100vh-4.5rem-var(--header-height)-var(--header-padding))] rounded-lg">
        {!isLoading && !data?.data && (
          <RecordSheetUnavailable Icon={ChatCircleDotsIcon} recordLabel="Conversation" />
        )}
        {!isLoading && data?.data && (
          <div
            className={
              "w-full border border-line flex bg-surface rounded-lg  overflow-hidden h-[calc(100vh-2.5*var(--header-height))]"
            }
          >
            <div className="w-full md:w-[30%] lg:w-[25%] md:border-r flex-shrink-0 flex flex-col">
              <ConversationMeta data={data?.data} />
            </div>

            <div className={"w-full md:w-[70%] lg:w-[75%] flex-shrink-0 flex flex-col"}>
              <ChatSection data={data?.data} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
