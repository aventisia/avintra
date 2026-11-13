import { Input, Skeleton } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import {
  DeleteDDMenuItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  SimpleDDMenuItem,
} from "@avplatform/ui/dropdown-menu";
import { cn } from "@avplatform/ui/lib";
import {
  ArchiveIcon,
  ArrowLeftIcon,
  ArrowUUpLeftIcon,
  CheckIcon,
  CircleNotchIcon,
  DotsThreeIcon,
  FolderSimpleIcon,
  MagnifyingGlassIcon,
  NotePencilIcon,
  PencilSimpleIcon,
  PlusIcon,
  PushPinIcon,
  PushPinSlashIcon,
  SidebarSimpleIcon,
} from "@phosphor-icons/react";
import { type MouseEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { type ChatHistoryItem, groupHistoryByDate } from "../utils/history-groups.util";
import { ChatIconButton } from "./ChatIconButton";
import { ChatTitleInput } from "./ChatTitleInput";

const IS_MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);
const NEW_CHAT_SHORTCUT_LABEL = IS_MAC ? "⌘⇧O" : "Ctrl+Shift+O";

export type ChatHistoryProject = { id: string; name: string };

export type ChatHistoryProps = {
  items: readonly ChatHistoryItem[];
  activeId?: string;
  getHref: (id: string) => string;
  /** Opens a chat in place; modified clicks fall through to the link. */
  onOpen: (id: string) => void;
  onNewChat: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (item: ChatHistoryItem) => void;
  /** Pins or unpins a chat; the menu item is hidden without it. */
  onTogglePin?: (item: ChatHistoryItem) => void;
  /** Lists archived chats instead of the active ones. */
  showArchived?: boolean;
  /** Switches between active and archived chats; the button is hidden without it. */
  onShowArchivedChange?: (showArchived: boolean) => void;
  /** Archives a chat, or restores it while archived chats are shown; the menu item is hidden without it. */
  onToggleArchive?: (item: ChatHistoryItem) => void;
  /** Collapses the panel; the button is hidden without it. */
  onCollapse?: () => void;
  search: string;
  onSearchChange: (search: string) => void;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  /** The projects chats can be filed under; the filter row and move menu need them. */
  projects?: readonly ChatHistoryProject[];
  /** The project the list is filtered to, or null for all chats. */
  activeProjectId?: string | null;
  /** Filters the list to a project, or null for all chats; the filter row is hidden without it. */
  onProjectFilterChange?: (projectId: string | null) => void;
  /** Creates a project from the filter row's name field; the plus button is hidden without it. */
  onCreateProject?: (name: string) => void;
  /** Files a chat under a project, or ungroups it with null; the move menu is hidden without it. */
  onMoveToProject?: (item: ChatHistoryItem, projectId: string | null) => void;
};

/**
 * The chat history panel: new chat, title search, and chats grouped by day
 * that load more on scroll and can be renamed, pinned, archived or deleted.
 */
export const ChatHistory = ({
  items,
  activeId,
  getHref,
  onOpen,
  onNewChat,
  onRename,
  onDelete,
  onTogglePin,
  showArchived = false,
  onShowArchivedChange,
  onToggleArchive,
  onCollapse,
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
}: ChatHistoryProps) => {
  const groups = useMemo(() => groupHistoryByDate(items), [items]);
  const [renamingId, setRenamingId] = useState<string | null>(null);

  return (
    <nav aria-label="Chat history" className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center gap-1 px-3">
        {showArchived && onShowArchivedChange && (
          <ChatIconButton label="Back to chats" onClick={() => onShowArchivedChange(false)}>
            <ArrowLeftIcon />
          </ChatIconButton>
        )}
        <h2 className="mr-auto pl-1 text-sm font-semibold text-ink">
          {showArchived ? "Archived chats" : "Chats"}
        </h2>
        {!showArchived && onShowArchivedChange && (
          <ChatIconButton label="Archived chats" onClick={() => onShowArchivedChange(true)}>
            <ArchiveIcon />
          </ChatIconButton>
        )}
        {onCollapse && (
          <ChatIconButton label="Close chat history" onClick={onCollapse}>
            <SidebarSimpleIcon />
          </ChatIconButton>
        )}
      </div>

      <div className="space-y-2 px-3 pb-2">
        <button
          type="button"
          onClick={onNewChat}
          className="group/new flex h-9 w-full items-center gap-2.5 rounded-lg px-2 text-sm font-medium text-ink transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <NotePencilIcon className="size-4 shrink-0" />
          New chat
          <kbd className="ml-auto font-sans text-xs font-normal text-muted-foreground opacity-0 transition-opacity group-hover/new:opacity-100 group-focus-visible/new:opacity-100">
            {NEW_CHAT_SHORTCUT_LABEL}
          </kbd>
        </button>
        <div className="relative">
          <MagnifyingGlassIcon
            aria-hidden
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search chats"
            aria-label="Search chats"
            className="h-9 rounded-lg pl-8 text-sm"
          />
        </div>
      </div>

      {!showArchived && onProjectFilterChange && (
        <ProjectFilter
          projects={projects}
          activeProjectId={activeProjectId}
          onChange={onProjectFilterChange}
          onCreate={onCreateProject}
        />
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 [scrollbar-gutter:stable]">
        {isLoading ? (
          <HistorySkeleton />
        ) : isError ? (
          <HistoryNote>
            Couldn't load your chats.
            <Button variant="link" className="h-auto p-0 text-sm" onClick={onRetry}>
              Try again
            </Button>
          </HistoryNote>
        ) : groups.length === 0 ? (
          <HistoryNote>
            {search.trim()
              ? `No chats match “${search.trim()}”.`
              : showArchived
                ? "Chats you archive will show up here."
                : activeProjectId
                  ? "Chats you move into this project will show up here."
                  : "Your chats will show up here."}
          </HistoryNote>
        ) : (
          groups.map((group) => (
            <section key={group.label} aria-label={group.label} className="pt-3 first:pt-1">
              <h3 className="px-2 pb-1 text-xs font-medium text-muted-foreground">{group.label}</h3>
              <ul>
                {group.items.map((item) => (
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
                      <HistoryLink
                        item={item}
                        isActive={item.id === activeId}
                        href={getHref(item.id)}
                        onOpen={onOpen}
                        onRename={() => setRenamingId(item.id)}
                        onDelete={() => onDelete(item)}
                        onTogglePin={
                          !showArchived && onTogglePin ? () => onTogglePin(item) : undefined
                        }
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
            </section>
          ))
        )}
        {hasMore && !isLoading && (
          // Remounting after each page re-checks visibility when a page doesn't fill the panel.
          <LoadMoreSentinel key={items.length} onVisible={onLoadMore} />
        )}
        {isLoadingMore && (
          <div role="status" aria-label="Loading more chats" className="flex justify-center py-2">
            <CircleNotchIcon className="size-4 animate-spin text-muted-foreground motion-reduce:animate-none" />
          </div>
        )}
      </div>
    </nav>
  );
};

const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

type HistoryLinkProps = {
  item: ChatHistoryItem;
  isActive: boolean;
  href: string;
  onOpen: (id: string) => void;
  onRename: () => void;
  onDelete: () => void;
  onTogglePin?: () => void;
  archiveLabel: "Archive" | "Unarchive";
  onToggleArchive?: () => void;
  projects: readonly ChatHistoryProject[];
  onMove?: (projectId: string | null) => void;
};

const HistoryLink = ({
  item,
  isActive,
  href,
  onOpen,
  onRename,
  onDelete,
  onTogglePin,
  archiveLabel,
  onToggleArchive,
  projects,
  onMove,
}: HistoryLinkProps) => {
  const isRenamingRef = useRef(false);

  return (
    <div
      className={cn(
        "group/item relative flex h-9 items-center rounded-lg transition-colors hover:bg-hover has-[[data-state=open]]:bg-hover",
        isActive && "bg-hover",
      )}
    >
      <a
        href={href}
        aria-current={isActive ? "page" : undefined}
        title={item.title}
        onClick={(event) => {
          if (!isPlainClick(event)) return;
          event.preventDefault();
          onOpen(item.id);
        }}
        className={cn(
          "flex h-full min-w-0 flex-1 items-center rounded-lg pl-2 pr-9 text-sm text-ink-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
          isActive && "font-medium text-ink",
        )}
      >
        <span className="truncate">{item.title}</span>
      </a>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Options for ${item.title}`}
          className="absolute right-1 top-1 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:text-ink focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus group-hover/item:opacity-100 data-[state=open]:opacity-100 [@media(hover:none)]:opacity-100"
        >
          <DotsThreeIcon weight="bold" className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="flex min-w-36 flex-col"
          onCloseAutoFocus={(event) => {
            // The rename input takes focus instead of the menu trigger.
            if (isRenamingRef.current) event.preventDefault();
            isRenamingRef.current = false;
          }}
        >
          <SimpleDDMenuItem
            content="Rename"
            Icon={PencilSimpleIcon}
            onSelect={() => {
              isRenamingRef.current = true;
              onRename();
            }}
          />
          {onTogglePin && (
            <SimpleDDMenuItem
              content={item.isPinned ? "Unpin" : "Pin"}
              Icon={item.isPinned ? PushPinSlashIcon : PushPinIcon}
              onSelect={onTogglePin}
            />
          )}
          {onToggleArchive && (
            <SimpleDDMenuItem
              content={archiveLabel}
              Icon={archiveLabel === "Archive" ? ArchiveIcon : ArrowUUpLeftIcon}
              onSelect={onToggleArchive}
            />
          )}
          {onMove && projects.length > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2 text-sm">
                <FolderSimpleIcon className="size-4 shrink-0" />
                Move to project
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="flex min-w-40 flex-col">
                <SimpleDDMenuItem
                  content="No project"
                  Icon={item.projectId ? undefined : CheckIcon}
                  onSelect={() => onMove(null)}
                />
                {projects.map((project) => (
                  <SimpleDDMenuItem
                    key={project.id}
                    content={project.name}
                    Icon={item.projectId === project.id ? CheckIcon : undefined}
                    onSelect={() => onMove(project.id)}
                  />
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
          <DeleteDDMenuItem onSelect={onDelete} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const ProjectFilter = ({
  projects,
  activeProjectId,
  onChange,
  onCreate,
}: {
  projects: readonly ChatHistoryProject[];
  activeProjectId: string | null;
  onChange: (projectId: string | null) => void;
  onCreate?: (name: string) => void;
}) => {
  const [draft, setDraft] = useState<string | null>(null);
  const doneRef = useRef(false);

  // Enter and blur can both fire for one name, so only the first one counts.
  const finish = (name: string | null) => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDraft(null);
    if (name && onCreate) onCreate(name);
  };

  return (
    <div
      role="group"
      aria-label="Filter by project"
      className="flex items-center gap-1.5 overflow-x-auto px-3 pb-3 [scrollbar-width:none]"
    >
      <FilterPill active={activeProjectId === null} onClick={() => onChange(null)}>
        All chats
      </FilterPill>
      {projects.map((project) => (
        <FilterPill
          key={project.id}
          active={activeProjectId === project.id}
          onClick={() => onChange(project.id)}
        >
          {project.name}
        </FilterPill>
      ))}
      {onCreate &&
        (draft === null ? (
          <button
            type="button"
            aria-label="New project"
            title="New project"
            onClick={() => {
              doneRef.current = false;
              setDraft("");
            }}
            className="flex size-7 shrink-0 items-center justify-center rounded-full border border-line text-muted-foreground transition-colors hover:bg-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <PlusIcon className="size-3.5" />
          </button>
        ) : (
          <Input
            autoFocus
            value={draft}
            maxLength={100}
            aria-label="Project name"
            placeholder="Project name"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") finish(draft.trim() || null);
              if (event.key === "Escape") finish(null);
            }}
            onBlur={() => finish(draft.trim() || null)}
            className="h-7 w-32 shrink-0 rounded-full px-2.5 text-xs"
          />
        ))}
    </div>
  );
};

const FilterPill = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className="h-7 max-w-40 shrink-0 truncate rounded-full border border-line px-2.5 text-xs text-ink-2 transition-colors hover:bg-hover aria-pressed:border-ink aria-pressed:font-medium aria-pressed:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
  >
    {children}
  </button>
);

const LoadMoreSentinel = ({ onVisible }: { onVisible: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  const onVisibleRef = useRef(onVisible);
  onVisibleRef.current = onVisible;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry?.isIntersecting && onVisibleRef.current(),
      { root: node.parentElement, rootMargin: "200px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} aria-hidden className="h-px" />;
};

const HistoryNote = ({ children }: { children: ReactNode }) => (
  <p className="flex flex-wrap items-center gap-x-1.5 px-2 pt-3 text-sm text-muted-foreground">
    {children}
  </p>
);

const HistorySkeleton = () => (
  <div role="status" aria-label="Loading chats" className="space-y-2 px-2 pt-3">
    {[72, 55, 85, 60, 78, 48].map((width) => (
      <Skeleton key={width} className="h-4 rounded" style={{ width: `${width}%` }} />
    ))}
  </div>
);
