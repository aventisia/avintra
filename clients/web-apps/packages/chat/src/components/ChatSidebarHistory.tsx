import { Checkbox, Input, Skeleton } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import {
  DeleteDDMenuItem,
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
  CheckSquareIcon,
  CircleNotchIcon,
  FadersHorizontalIcon,
  FolderPlusIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  SlidersHorizontalIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";
import { type ReactNode, useMemo, useState } from "react";

import { CHAT_TITLE_MAX_LENGTH, PROJECT_NAME_MAX_LENGTH } from "../constants/chat-name.constant";
import { useInlineEditFocusGuard } from "../hooks/useInlineEditFocusGuard.hook";
import { groupHistoryByDate } from "../utils/history-groups.util";
import {
  type ChatHistoryProject,
  type ChatHistoryProps,
  ChatHistoryRow,
  LoadMoreSentinel,
} from "./ChatHistory";
import { ChatNameInput } from "./ChatNameInput";

export type ChatSidebarHistoryProps = Omit<ChatHistoryProps, "onNewChat" | "onCollapse">;

const ALL_CHATS = "all";

type ProjectEdit = { mode: "create" } | { mode: "rename"; project: ChatHistoryProject };

const SIDEBAR_INPUT_CLASS = "h-8 rounded-sm px-[11px] text-body-sm";

/**
 * Chats as a section of the app sidebar: a quiet label with search and a
 * project/archive filter, then chats as menu rows grouped into Pinned, Today,
 * Yesterday, Last 7 days and Older, which scroll with the sidebar and load
 * more on the way down. Select mode swaps the rows for checkboxes to archive or delete several chats.
 */
export const ChatSidebarHistory = ({
  items,
  activeId,
  getHref,
  onOpen,
  onRename,
  onDelete,
  onArchiveMany,
  onDeleteMany,
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
  onRenameProject,
  onEditProject,
  onDeleteProject,
  onMoveToProject,
}: ChatSidebarHistoryProps) => {
  const [isSearching, setIsSearching] = useState(search !== "");
  const [projectEdit, setProjectEdit] = useState<ProjectEdit | null>(null);
  const projectMenuFocusGuard = useInlineEditFocusGuard();
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string> | null>(null);
  const isSelecting = selectedIds !== null;
  const visibleSelectedIds = items
    .filter((item) => selectedIds?.has(item.id))
    .map((item) => item.id);
  const [isArchivingMany, setIsArchivingMany] = useState(false);
  const groups = useMemo(() => groupHistoryByDate(items), [items]);
  const activeProject = projects.find((project) => project.id === activeProjectId);
  const canFilter = !!onProjectFilterChange || !!onShowArchivedChange;

  const closeSearch = () => {
    setIsSearching(false);
    onSearchChange("");
  };

  const toggleSelected = (id: string, isSelected: boolean) =>
    setSelectedIds((current) => {
      const next = new Set(current);
      if (isSelected) next.add(id);
      else next.delete(id);
      return next;
    });

  const archiveSelected = async () => {
    if (!onArchiveMany) return;
    setIsArchivingMany(true);
    try {
      await onArchiveMany(visibleSelectedIds);
      setSelectedIds(null);
    } catch {
      // The caller reports the failure; the selection stays for another try.
    } finally {
      setIsArchivingMany(false);
    }
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
          className="opacity-0 focus-visible:opacity-100 group-hover/chats:opacity-100 aria-pressed:opacity-100 [@media(hover:none)]:opacity-100"
          onClick={() => (isSearching ? closeSearch() : setIsSearching(true))}
        >
          <MagnifyingGlassIcon />
        </SectionButton>
        {onDeleteMany && items.length > 0 && (
          <SectionButton
            label={isSelecting ? "Stop selecting" : "Select chats"}
            isPressed={isSelecting}
            className="opacity-0 focus-visible:opacity-100 group-hover/chats:opacity-100 aria-pressed:opacity-100 [@media(hover:none)]:opacity-100"
            onClick={() => setSelectedIds(isSelecting ? null : new Set())}
          >
            <CheckSquareIcon />
          </SectionButton>
        )}
        {canFilter && !showArchived && (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Filter chats"
              title="Filter chats"
              className={cn(
                SECTION_BUTTON_CLASS,
                "opacity-0 focus-visible:opacity-100 group-hover/chats:opacity-100 [@media(hover:none)]:opacity-100 data-[state=open]:bg-hover data-[state=open]:text-ink data-[state=open]:opacity-100",
                activeProject && "opacity-100",
              )}
            >
              <FadersHorizontalIcon className="size-3.5" />
            </DropdownMenuTrigger>
            <MenuContent
              align="end"
              className="w-56"
              onCloseAutoFocus={projectMenuFocusGuard.onCloseAutoFocus}
            >
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
                      onSelect={() => {
                        projectMenuFocusGuard.markEditing();
                        setProjectEdit({ mode: "create" });
                      }}
                    />
                  )}
                  {activeProject && onRenameProject && (
                    <SimpleDDMenuItem
                      content="Rename project"
                      Icon={PencilSimpleIcon}
                      onSelect={() => {
                        projectMenuFocusGuard.markEditing();
                        setProjectEdit({ mode: "rename", project: activeProject });
                      }}
                    />
                  )}
                  {activeProject && onEditProject && (
                    <SimpleDDMenuItem
                      content="Project settings"
                      Icon={SlidersHorizontalIcon}
                      onSelect={() => onEditProject(activeProject)}
                    />
                  )}
                  {activeProject && onDeleteProject && (
                    <DeleteDDMenuItem onSelect={() => onDeleteProject(activeProject)} />
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

      {projectEdit && (
        <div className="px-0.5 pb-1">
          <ChatNameInput
            key={projectEdit.mode === "rename" ? projectEdit.project.id : projectEdit.mode}
            initialName={projectEdit.mode === "rename" ? projectEdit.project.name : ""}
            label={projectEdit.mode === "rename" ? "Rename project" : "Project name"}
            maxLength={PROJECT_NAME_MAX_LENGTH}
            placeholder="Name the project, then press Enter"
            className={SIDEBAR_INPUT_CLASS}
            onDone={(name) => {
              setProjectEdit(null);
              if (!name) return;
              if (projectEdit.mode === "create") onCreateProject?.(name);
              else if (name !== projectEdit.project.name)
                onRenameProject?.(projectEdit.project.id, name);
            }}
          />
        </div>
      )}

      {isSelecting && onDeleteMany && (
        <div className="flex items-center gap-1 px-2 pb-1">
          <span className="mr-auto text-body-sm text-muted-foreground" aria-live="polite">
            {visibleSelectedIds.length} selected
          </span>
          {onArchiveMany && (
            <SectionButton
              label="Archive selected chats"
              disabled={visibleSelectedIds.length === 0 || isArchivingMany}
              onClick={() => void archiveSelected()}
            >
              <ArchiveIcon />
            </SectionButton>
          )}
          <SectionButton
            label="Delete selected chats"
            disabled={visibleSelectedIds.length === 0}
            className="hover:text-bad"
            onClick={() => onDeleteMany(visibleSelectedIds, () => setSelectedIds(null))}
          >
            <TrashIcon />
          </SectionButton>
          <SectionButton label="Stop selecting" onClick={() => setSelectedIds(null)}>
            <XIcon />
          </SectionButton>
        </div>
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
        groups.map((group) => (
          <section key={group.label} aria-label={group.label} className="pt-2 first:pt-0">
            <h4 className="px-2 pb-0.5 text-body-sm text-muted-foreground">{group.label}</h4>
            <ul className="flex flex-col gap-px">
              {group.items.map((item) => (
                <li key={item.id}>
                  {isSelecting ? (
                    <label className="flex h-8 cursor-pointer items-center gap-2 rounded-sm px-2 text-body-sm text-ink-2 hover:bg-hover">
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={(checked) => toggleSelected(item.id, checked === true)}
                        aria-label={`Select ${item.title}`}
                      />
                      <span className="min-w-0 truncate">{item.title}</span>
                    </label>
                  ) : renamingId === item.id ? (
                    <ChatNameInput
                      initialName={item.title}
                      label="Chat title"
                      maxLength={CHAT_TITLE_MAX_LENGTH}
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
  disabled,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  isPressed?: boolean;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    aria-pressed={isPressed}
    disabled={disabled}
    onClick={onClick}
    className={cn(
      SECTION_BUTTON_CLASS,
      "[&>svg]:size-3.5 aria-pressed:bg-hover aria-pressed:text-ink disabled:pointer-events-none disabled:opacity-40",
      className,
    )}
  >
    {children}
  </button>
);

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
