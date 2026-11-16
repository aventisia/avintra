import { Input, Skeleton } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import {
  DropdownMenu,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  MenuContent,
  MenuLabel,
  MenuSeparator,
  SimpleDDMenuItem,
} from "@avplatform/ui/dropdown-menu";
import { cn } from "@avplatform/ui/lib";
import {
  ArchiveIcon,
  ArrowLeftIcon,
  CircleNotchIcon,
  FadersHorizontalIcon,
  FolderPlusIcon,
  MagnifyingGlassIcon,
  XIcon,
} from "@phosphor-icons/react";
import { type ReactNode, useRef, useState } from "react";

import { type ChatHistoryProps, ChatHistoryRow, LoadMoreSentinel } from "./ChatHistory";
import { ChatTitleInput } from "./ChatTitleInput";

export type ChatSidebarHistoryProps = Omit<ChatHistoryProps, "onNewChat" | "onCollapse">;

const ALL_CHATS = "all";

/**
 * Chats as a section of the app sidebar: a quiet label with search and a
 * project/archive filter, then pinned chats and recent chats as menu rows
 * that scroll with the sidebar and load more on the way down.
 */
export const ChatSidebarHistory = ({
  items,
  activeId,
  getHref,
  onOpen,
  onRename,
  onDelete,
  onTogglePin,
  showArchived = false,
  onShowArchivedChange,
  onToggleArchive,
  search,
  onSearchChange,
  isLoading,
  isError,
  onRetry,
  hasMore,
  isLoadingMore,
  onLoadMore,
  projects = [],
  activeProjectId = null,
  onProjectFilterChange,
  onCreateProject,
  onMoveToProject,
}: ChatSidebarHistoryProps) => {
  const [isSearching, setIsSearching] = useState(search !== "");
  const [projectDraft, setProjectDraft] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const activeProject = projects.find((project) => project.id === activeProjectId);
  const canFilter = !!onProjectFilterChange || !!onShowArchivedChange;

  const closeSearch = () => {
    setIsSearching(false);
    onSearchChange("");
  };

  const heading = showArchived ? "Archived" : (activeProject?.name ?? "Chats");

  return (
    <section aria-label="Chats" className="mt-3">
      <div aria-hidden className="mx-2 border-t border-line" />
      <div className="group/chats flex h-[34px] items-end gap-1 px-2 pb-[3px]">
        {showArchived && onShowArchivedChange && (
          <SectionButton label="Back to chats" onClick={() => onShowArchivedChange(false)}>
            <ArrowLeftIcon />
          </SectionButton>
        )}
        <h3
          className="mr-auto min-w-0 truncate pb-0.5 font-mono text-label uppercase text-muted-foreground"
          title={heading}
        >
          {heading}
        </h3>
        {activeProject && !showArchived && onProjectFilterChange && (
          <SectionButton label="Show all chats" onClick={() => onProjectFilterChange(null)}>
            <XIcon />
          </SectionButton>
        )}
        <SectionButton
          label="Search chats"
          isPressed={isSearching}
          className="opacity-0 group-hover/chats:opacity-100 aria-pressed:opacity-100"
          onClick={() => (isSearching ? closeSearch() : setIsSearching(true))}
        >
          <MagnifyingGlassIcon />
        </SectionButton>
        {canFilter && !showArchived && (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Filter chats"
              title="Filter chats"
              className={cn(
                SECTION_BUTTON_CLASS,
                "opacity-0 group-hover/chats:opacity-100 data-[state=open]:bg-hover data-[state=open]:text-ink data-[state=open]:opacity-100",
                activeProject && "opacity-100",
              )}
            >
              <FadersHorizontalIcon className="size-3.5" />
            </DropdownMenuTrigger>
            <MenuContent align="end" className="w-56">
              {onProjectFilterChange && (
                <>
                  <MenuLabel>Projects</MenuLabel>
                  <DropdownMenuRadioGroup
                    value={activeProjectId ?? ALL_CHATS}
                    onValueChange={(value) =>
                      onProjectFilterChange(value === ALL_CHATS ? null : value)
                    }
                  >
                    <DropdownMenuRadioItem value={ALL_CHATS}>All chats</DropdownMenuRadioItem>
                    {projects.map((project) => (
                      <DropdownMenuRadioItem key={project.id} value={project.id}>
                        <span className="truncate">{project.name}</span>
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                  {onCreateProject && (
                    <SimpleDDMenuItem
                      content="New project"
                      Icon={FolderPlusIcon}
                      onSelect={() => setProjectDraft("")}
                    />
                  )}
                </>
              )}
              {onShowArchivedChange && (
                <>
                  {onProjectFilterChange && <MenuSeparator />}
                  <SimpleDDMenuItem
                    content="Archived chats"
                    Icon={ArchiveIcon}
                    onSelect={() => onShowArchivedChange(true)}
                  />
                </>
              )}
            </MenuContent>
          </DropdownMenu>
        )}
      </div>

      {isSearching && (
        <div className="relative px-0.5 pb-1">
          <MagnifyingGlassIcon
            aria-hidden
            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-[calc(50%+2px)] text-muted-foreground"
          />
          <Input
            autoFocus
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={(event) => event.key === "Escape" && closeSearch()}
            placeholder="Search chats"
            aria-label="Search chats"
            className="h-8 rounded-sm pl-7 text-body-sm"
          />
        </div>
      )}

      {projectDraft !== null && onCreateProject && (
        <ProjectNameInput
          onDone={(name) => {
            setProjectDraft(null);
            if (name) onCreateProject(name);
          }}
        />
      )}

      {isLoading ? (
        <SidebarSkeleton />
      ) : isError ? (
        <SidebarNote>
          Couldn't load your chats.
          <Button variant="link" className="h-auto p-0 text-body-sm" onClick={onRetry}>
            Try again
          </Button>
        </SidebarNote>
      ) : items.length === 0 ? (
        <SidebarNote>
          {search.trim()
            ? `No chats match “${search.trim()}”.`
            : showArchived
              ? "Chats you archive show up here."
              : activeProjectId
                ? "Chats you move into this project show up here."
                : "Your chats show up here."}
        </SidebarNote>
      ) : (
        <ul className="flex flex-col gap-px">
          {items.map((item) => (
            <li key={item.id}>
              {renamingId === item.id ? (
                <ChatTitleInput
                  title={item.title}
                  onDone={(title) => {
                    setRenamingId(null);
                    if (title && title !== item.title) onRename(item.id, title);
                  }}
                />
              ) : (
                <ChatHistoryRow
                  variant="sidebar"
                  item={item}
                  isActive={item.id === activeId}
                  href={getHref(item.id)}
                  onOpen={onOpen}
                  onRename={() => setRenamingId(item.id)}
                  onDelete={() => onDelete(item)}
                  onTogglePin={!showArchived && onTogglePin ? () => onTogglePin(item) : undefined}
                  archiveLabel={showArchived ? "Unarchive" : "Archive"}
                  onToggleArchive={onToggleArchive && (() => onToggleArchive(item))}
                  projects={projects}
                  onMove={
                    !showArchived && onMoveToProject
                      ? (projectId) => onMoveToProject(item, projectId)
                      : undefined
                  }
                />
              )}
            </li>
          ))}
        </ul>
      )}
      {hasMore && !isLoading && (
        // Remounting after each page re-checks visibility when a page doesn't fill the sidebar.
        <LoadMoreSentinel key={items.length} onVisible={onLoadMore} scrollsWithPage />
      )}
      {isLoadingMore && (
        <div role="status" aria-label="Loading more chats" className="flex justify-center py-2">
          <CircleNotchIcon className="size-4 animate-spin text-muted-foreground motion-reduce:animate-none" />
        </div>
      )}
    </section>
  );
};

const SECTION_BUTTON_CLASS =
  "inline-flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-[color,background-color,opacity] duration-[120ms] hover:bg-hover hover:text-ink focus-visible:opacity-100 focus-visible:shadow-focus focus-visible:outline-none [@media(hover:none)]:opacity-100 motion-reduce:transition-none";

const SectionButton = ({
  label,
  onClick,
  isPressed,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  isPressed?: boolean;
  className?: string;
  children: ReactNode;
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    aria-pressed={isPressed}
    onClick={onClick}
    className={cn(
      SECTION_BUTTON_CLASS,
      "[&>svg]:size-3.5 aria-pressed:bg-hover aria-pressed:text-ink",
      className,
    )}
  >
    {children}
  </button>
);

const ProjectNameInput = ({ onDone }: { onDone: (name: string | null) => void }) => {
  const [name, setName] = useState("");
  const doneRef = useRef(false);

  // Enter and blur can both fire for one name, so only the first one counts.
  const finish = (value: string | null) => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone(value);
  };

  return (
    <div className="px-0.5 pb-1">
      <Input
        autoFocus
        value={name}
        maxLength={100}
        aria-label="Project name"
        placeholder="Name the project, then press Enter"
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") finish(name.trim() || null);
          if (event.key === "Escape") finish(null);
        }}
        onBlur={() => finish(name.trim() || null)}
        className="h-8 rounded-sm text-body-sm"
      />
    </div>
  );
};

const SidebarNote = ({ children }: { children: ReactNode }) => (
  <p className="flex flex-wrap items-center gap-x-1.5 px-2 py-1.5 text-body-sm text-muted-foreground">
    {children}
  </p>
);

const SidebarSkeleton = () => (
  <div role="status" aria-label="Loading chats" className="space-y-3 px-2 py-2">
    {[78, 62, 86, 54, 70].map((width) => (
      <Skeleton key={width} className="h-3.5 rounded" style={{ width: `${width}%` }} />
    ))}
  </div>
);
