import { Skeleton } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { toast } from "@avplatform/ui/sonner";
import { Tooltip } from "@avplatform/ui/tooltip";
import { ClockCounterClockwiseIcon, FlagIcon, RocketIcon } from "@phosphor-icons/react";
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

const RAIL_CLASS = "relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-2.5";
const CONNECTOR_CLASS = "absolute left-3 top-[2.125rem] -bottom-2.5 w-px -translate-x-1/2 bg-line";

interface VersionTimelineProps {
  versions: FlowVersionDto[] | undefined;
  isLoading: boolean;
}

/**
 * Every version of the agent, newest first, drawn as canvas nodes on a rail that ends at the
 * agent's creation. The viewed version carries the canvas selection ring.
 */
export const VersionTimeline = ({ versions, isLoading }: VersionTimelineProps) => {
  const navigate = useNavigate();
  const withQueryParams = useCarryParams(["f", "v", "return"]);
  const { data: changeHistory } = useFetchVersionHistoryList();
  const oldest = versions?.[versions.length - 1];

  const openChangeHistory = () => {
    if (!changeHistory?.data?.length) {
      toast.info("No change history present");
      return;
    }
    usePanelStore.getState().closePanel(AGENT_DETAILS_PANEL_ID);
    navigate(withQueryParams("/agent-history"));
  };

  return (
    <section aria-labelledby="agent-versions-heading" className="px-4 pb-6 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 id="agent-versions-heading" className="text-body-sm font-semibold text-ink">
          Versions
          {versions?.length ? (
            <span className="ml-1.5 font-normal tabular-nums text-muted-foreground">
              ({versions.length})
            </span>
          ) : null}
        </h3>
        <Button variant="ghost" size="xs" className="-mr-2" onClick={openChangeHistory}>
          <ClockCounterClockwiseIcon className="size-3.5" />
          Change history
        </Button>
      </div>
      {isLoading ? (
        <div className="space-y-2 pl-9">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-11 rounded-lg" />
          ))}
        </div>
      ) : (
        <ol>
          {versions?.map((version) => (
            <VersionRow key={version.id} version={version} />
          ))}
          {oldest?.createdOn ? (
            <CreationRow version={oldest} createdOn={new Date(oldest.createdOn)} />
          ) : null}
        </ol>
      )}
    </section>
  );
};

const VersionNode = ({ isViewing, isPublished }: { isViewing: boolean; isPublished: boolean }) => (
  <span
    aria-hidden="true"
    className={cn(
      "relative mt-2.5 grid size-6 place-items-center rounded-md border bg-surface transition-shadow",
      isPublished ? "border-ok/60" : "border-line-strong/70",
      isViewing && "border-primary ring-[3px] ring-primary/20",
    )}
  >
    {isPublished ? (
      <RocketIcon weight="fill" className="size-3 text-ok" />
    ) : (
      <span
        className={cn("size-1.5 rounded-full", isViewing ? "bg-primary" : "bg-line-strong/60")}
      />
    )}
  </span>
);

const VersionRow = ({ version }: { version: FlowVersionDto }) => {
  const viewingId = useFlowsVersionsStore((state) => state.versionID);
  const openFlow = useOpenFlow();
  const isViewing = version.id === viewingId;
  const isPublished = !!version.isPublished;
  const createdOn = version.createdOn ? new Date(version.createdOn) : undefined;

  const open = () => {
    if (!isViewing) openFlow(version.flowId, version.id);
  };

  return (
    <li className={RAIL_CLASS}>
      <span aria-hidden="true" className={CONNECTOR_CLASS} />
      <div className="flex justify-center">
        <VersionNode isViewing={isViewing} isPublished={isPublished} />
      </div>
      <div
        role="button"
        tabIndex={0}
        aria-current={isViewing ? "true" : undefined}
        aria-label={`Version ${version.versionNumber}${isPublished ? ", published" : ""}${isViewing ? ", viewing" : ""}`}
        onClick={open}
        onKeyDown={(e) => {
          if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            open();
          }
        }}
        className={cn(
          "group/version mb-1.5 flex min-w-0 items-center gap-2 rounded-lg px-2 py-1.5 transition-colors",
          "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-focus/[0.28]",
          !isViewing && "cursor-pointer hover:bg-hover",
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-body-sm font-medium text-ink">
              Version {version.versionNumber}
            </span>
            {isPublished ? (
              <span className="rounded-full bg-ok/10 px-1.5 text-[11px] font-medium leading-[18px] text-ok">
                Published
              </span>
            ) : null}
            {isViewing ? (
              <span className="text-[11px] font-medium leading-[18px] text-primary-text">
                Viewing
              </span>
            ) : null}
          </div>
          <div className="mt-0.5 flex min-w-0 items-center gap-2 text-hint text-muted-foreground">
            <AuthorChip version={version} />
            {createdOn ? (
              <Tooltip content={format(createdOn, "MMM d, yyyy 'at' h:mm a")}>
                <span className="shrink-0 tabular-nums">
                  {formatDistanceToNowStrict(createdOn, { addSuffix: true })}
                </span>
              </Tooltip>
            ) : null}
          </div>
        </div>
        <div
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 transition-opacity focus-within:opacity-100 group-hover/version:opacity-100 has-[[data-state=open]]:opacity-100"
        >
          <FlowVersionItemActions
            flowId={version.flowId}
            isPublished={isPublished}
            versionId={version.id || ""}
            versionNumber={version.versionNumber ?? null}
          />
        </div>
      </div>
    </li>
  );
};

const CreationRow = ({ version, createdOn }: { version: FlowVersionDto; createdOn: Date }) => (
  <li className={RAIL_CLASS}>
    <div className="flex justify-center">
      <span
        aria-hidden="true"
        className="mt-2.5 grid size-6 place-items-center rounded-full border border-dashed border-line-strong/70 bg-sunken text-muted-foreground"
      >
        <FlagIcon className="size-3" />
      </span>
    </div>
    <div className="px-2 py-1.5">
      <div className="flex min-w-0 items-center gap-1.5 text-body-sm text-ink-2">
        <span className="shrink-0">Created by</span>
        <AuthorChip version={version} />
      </div>
      <div className="mt-0.5 text-hint tabular-nums text-muted-foreground">
        {format(createdOn, "MMMM d, yyyy")}
      </div>
    </div>
  </li>
);
