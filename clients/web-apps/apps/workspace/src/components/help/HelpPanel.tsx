import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { ScrollArea } from "@avplatform/ui/scroll";
import { Tooltip } from "@avplatform/ui/tooltip";
import { isRouteWithin } from "@avplatform/ui/utils";
import { ArrowLeftIcon, ArrowUpRightIcon, BooksIcon, XIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import MarkdownViewer from "@/components/markdown/MarkdownViewer";
import {
  type HelpGuideContent,
  type HelpSection,
  getAllGuides,
  getGuide,
  getGuideForPath,
} from "@/docs-content";
import { useAllowedRoutesStore } from "@/stores/allowed-routes-auth-store";

import { useHelpPanelStore } from "./help-panel.store";

const SECTION_LABELS: Record<HelpSection, string> = {
  build: "Build",
  configure: "Configure",
  orchestrator: "Orchestrator",
  assist: "Assist",
  "tenant-admin": "Tenant admin",
  "super-admin": "Multi-tenant admin",
  "global-admin": "Global admin",
};

const ICON_BUTTON_CLASS_NAME = cn(
  buttonVariants({ variant: "ghost", size: "icon7" }),
  "text-muted-foreground",
);

const LIST_ROW_CLASS_NAME =
  "flex w-full flex-col rounded-sm px-2 py-1.5 text-left outline-none transition-colors duration-[120ms] ease-out hover:bg-hover focus-visible:shadow-focus motion-reduce:transition-none";

/**
 * Help panel docked beside the page content. It shows the current page's guide, an explicitly
 * opened guide, or the list of all guides; `?` toggles it and Escape closes it.
 */
export const HelpPanel = () => {
  const { pathname } = useLocation();
  const allowedRoutes = useAllowedRoutesStore((state) => state.allowedRoutes);
  const { isOpen, guideId, isIndexOpen, openGuide, toggleIndex, toggleOpen, followPage } =
    useHelpPanelStore(
      useShallow((state) => ({
        isOpen: state.isOpen,
        guideId: state.guideId,
        isIndexOpen: state.isIndexOpen,
        openGuide: state.openGuide,
        toggleIndex: state.toggleIndex,
        toggleOpen: state.toggleOpen,
        followPage: state.followPage,
      })),
    );

  useHotkeys("?", () => toggleOpen(), { useKey: true }, [toggleOpen]);
  useHotkeys("esc", () => toggleOpen(false), { enabled: isOpen }, [toggleOpen]);

  useEffect(() => {
    followPage();
  }, [pathname, followPage]);

  if (!isOpen) return null;

  const isGuideAllowed = (guide: HelpGuideContent) =>
    !guide.routes ||
    guide.routes.some((route) =>
      allowedRoutes.some(
        (allowedRoute) => isRouteWithin(allowedRoute, route) || isRouteWithin(route, allowedRoute),
      ),
    );

  const pageGuide = getGuideForPath(pathname);
  const guide = guideId ? getGuide(guideId) : pageGuide;
  const showIndex = isIndexOpen || !guide;
  const relatedGuides = (guide?.related ?? [])
    .map((relatedId) => getGuide(relatedId))
    .filter((related): related is HelpGuideContent => !!related && isGuideAllowed(related));

  return (
    <aside
      aria-label="Help"
      className="fixed inset-y-0 right-0 z-40 flex w-full max-w-[24rem] flex-col border-l border-line bg-surface shadow-lg md:static md:z-auto md:w-[22rem] md:shrink-0 md:shadow-none"
    >
      <div className="flex h-12 shrink-0 items-center gap-1 border-b border-line pl-4 pr-2">
        {showIndex && guide ? (
          <Tooltip content="Back to guide">
            <button
              type="button"
              aria-label="Back to guide"
              onClick={() => toggleIndex(false)}
              className={cn(ICON_BUTTON_CLASS_NAME, "-ml-2")}
            >
              <ArrowLeftIcon className="size-4" />
            </button>
          </Tooltip>
        ) : null}
        <span className="flex-1 font-mono text-label uppercase text-muted-foreground">
          {showIndex ? "All guides" : "Help"}
        </span>
        {!showIndex && (
          <Tooltip content="All guides">
            <button
              type="button"
              aria-label="All guides"
              onClick={() => toggleIndex(true)}
              className={ICON_BUTTON_CLASS_NAME}
            >
              <BooksIcon className="size-4" />
            </button>
          </Tooltip>
        )}
        <Tooltip content="Close" shortcut="?">
          <button
            type="button"
            aria-label="Close help"
            onClick={() => toggleOpen(false)}
            className={ICON_BUTTON_CLASS_NAME}
          >
            <XIcon className="size-4" />
          </button>
        </Tooltip>
      </div>

      {showIndex ? (
        <ScrollArea className="min-h-0 flex-1" viewportClassName="px-2.5 py-3 [&>div]:!block">
          {(Object.keys(SECTION_LABELS) as HelpSection[]).map((section) => {
            const sectionGuides = getAllGuides().filter(
              (candidate) => candidate.section === section && isGuideAllowed(candidate),
            );
            if (sectionGuides.length === 0) return null;
            return (
              <div key={section} className="mb-4 flex flex-col gap-px last:mb-0">
                <h3 className="px-2 pb-1.5 font-mono text-label uppercase text-muted-foreground">
                  {SECTION_LABELS[section]}
                </h3>
                {sectionGuides.map((candidate) => (
                  <button
                    key={candidate.id}
                    type="button"
                    onClick={() => openGuide(candidate.id)}
                    aria-current={candidate.id === pageGuide?.id ? "page" : undefined}
                    className={cn(LIST_ROW_CLASS_NAME, "aria-[current=page]:bg-fill")}
                  >
                    <span className="text-body-sm font-medium text-ink">{candidate.title}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {candidate.summary}
                    </span>
                  </button>
                ))}
              </div>
            );
          })}
        </ScrollArea>
      ) : (
        <>
          <ScrollArea
            className="min-h-0 flex-1"
            viewportClassName="px-4 pb-5 pt-4 break-words [&>div]:!block"
          >
            <h2 className="text-heading text-ink">{guide.title}</h2>
            <p className="mb-4 mt-1 text-body-sm text-muted-foreground">{guide.summary}</p>
            <MarkdownViewer textValue={guide.content} compact />
            {relatedGuides.length > 0 && (
              <div className="mt-6 border-t border-line pt-4">
                <h3 className="pb-1.5 font-mono text-label uppercase text-muted-foreground">
                  Related
                </h3>
                <div className="-mx-2 flex flex-col gap-px">
                  {relatedGuides.map((related) => (
                    <button
                      key={related.id}
                      type="button"
                      onClick={() => openGuide(related.id)}
                      className={LIST_ROW_CLASS_NAME}
                    >
                      <span className="text-body-sm font-medium text-ink">{related.title}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {related.summary}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
          {guide.docsSiteUrl && (
            <a
              href={guide.docsSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex shrink-0 items-center justify-between gap-2 border-t border-line bg-sunken px-4 py-3 text-body-sm font-medium text-primary-text outline-none transition-colors duration-[120ms] hover:bg-hover focus-visible:shadow-focus"
            >
              View full docs
              <ArrowUpRightIcon className="size-4 transition-transform duration-[120ms] group-hover:-translate-y-px group-hover:translate-x-px motion-reduce:transition-none" />
            </a>
          )}
        </>
      )}
    </aside>
  );
};
