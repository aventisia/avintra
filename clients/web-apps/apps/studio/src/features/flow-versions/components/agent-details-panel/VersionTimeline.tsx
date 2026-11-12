import { Skeleton } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { toast } from "@avplatform/ui/sonner";
import { Tooltip } from "@avplatform/ui/tooltip";
import { ClockCounterClockwiseIcon, RocketIcon } from "@phosphor-icons/react";
import { format, formatDistanceToNowStrict } from "date-fns";
import { useNavigate } from "react-router-dom";

import { usePanelStore } from "@/components/panel/stores/panel-store";
import { useOpenFlow } from "@/features/flows-popover/hooks/useOpenFlow";
import { useFetchVersionHistoryList } from "@/features/version-history/hooks/useFetchVersionHistoryList";
import { useCarryParams } from "@/features/version-history/hooks/useForwardQueryParams";

import { AGENT_DETAILS_PANEL_ID } from "../../constants";
import { FlowVersionDto } from "../../dtos/flow-version-dto";
import { useFlowsVersionsStore } from "../../stores/flow-versions-store";
import { FlowVersionItemActions } from "../flow-version-item-actions";
import { AuthorChip } from "./AuthorChip";

interface VersionTimelineProps {
  versions: FlowVersionDto[] | undefined;
  isLoading: boolean;
}

/**
 * Every version of the agent, newest first, as a timeline.
 */
export const VersionTimeline = ({ versions, isLoading }: VersionTimelineProps) => {
  const navigate = useNavigate();
  const withQueryParams = useCarryParams(["f", "v", "return"]);
  const { data: changeHistory } = useFetchVersionHistoryList();

  const openChangeHistory = () => {
    if (!changeHistory?.data?.length) {
      toast.info("No change history present");
      return;
    }
    usePanelStore.getState().closePanel(AGENT_DETAILS_PANEL_ID);
    navigate(withQueryParams("/agent-history"));
  };

  return (
    <section className="border-t border-line px-3 pb-4 pt-3">
      <div className="mb-1.5 flex items-center justify-between pl-1">
        <h3 className="text-body-sm font-semibold text-ink">
          Versions
          {versions?.length ? (
            <span className="ml-1.5 font-mono text-hint font-normal text-muted-foreground">
              {versions.length}
            </span>
          ) : null}
        </h3>
        <Button variant="ghost" size="xs" onClick={openChangeHistory}>
          <ClockCounterClockwiseIcon className="size-3.5" />
          Change history
        </Button>
      </div>
      {isLoading ? (
        <div className="space-y-2 pl-6">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-11 rounded-lg" />
          ))}
        </div>
      ) : (
        <ol>
          {versions?.map((version, index) => (
            <VersionRow key={version.id} version={version} isLast={index === versions.length - 1} />
          ))}
        </ol>
      )}
    </section>
  );
};

const VersionRow = ({ version, isLast }: { version: FlowVersionDto; isLast: boolean }) => {
  const viewingId = useFlowsVersionsStore((state) => state.versionID);
  const openFlow = useOpenFlow();
  const isViewing = version.id === viewingId;
  const createdOn = version.createdOn ? new Date(version.createdOn) : undefined;

  const open = () => {
    if (!isViewing) openFlow(version.flowId, version.id);
  };

  return (
    <li className="relative flex gap-1.5">
      <div aria-hidden="true" className="relative flex w-4 shrink-0 justify-center">
        {!isLast && <span className="absolute bottom-0 top-[22px] w-px bg-line" />}
        <span
          className={cn(
            "relative mt-[15px] size-2.5 rounded-full ring-4 ring-surface",
            isViewing
              ? "bg-primary"
              : version.isPublished
                ? "bg-ok"
                : "border-[1.5px] border-line-strong bg-surface",
          )}
        />
      </div>
      <div
        role="button"
        tabIndex={0}
        aria-current={isViewing ? "true" : undefined}
        onClick={open}
        onKeyDown={(e) => {
          if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            open();
          }
        }}
        className={cn(
          "mb-1 flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 transition-colors",
          "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-focus/[0.28]",
          isViewing ? "bg-primary/[0.07]" : "cursor-pointer hover:bg-hover",
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-body-sm font-medium text-ink">
              Version {version.versionNumber}
            </span>
            {version.isPublished ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-ok/10 px-1.5 text-[10.5px] font-medium leading-4 text-ok">
                <RocketIcon className="size-2.5" />
                Published
              </span>
            ) : null}
            {isViewing ? (
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-primary-text">
                Viewing
              </span>
            ) : null}
          </div>
          <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-hint text-muted-foreground">
            <AuthorChip version={version} />
            {createdOn ? (
              <>
                <span aria-hidden="true" className="size-[3px] shrink-0 rounded-full bg-fill" />
                <Tooltip content={format(createdOn, "MMM d, yyyy 'at' h:mm a")}>
                  <span className="shrink-0">
                    {formatDistanceToNowStrict(createdOn, { addSuffix: true })}
                  </span>
                </Tooltip>
              </>
            ) : null}
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <FlowVersionItemActions
            flowId={version.flowId}
            isPublished={!!version.isPublished}
            versionId={version.id || ""}
            versionNumber={version.versionNumber ?? null}
          />
        </div>
      </div>
    </li>
  );
};
