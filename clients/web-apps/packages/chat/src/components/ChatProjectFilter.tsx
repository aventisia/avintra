import {
  DeleteDDMenuItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  SimpleDDMenuItem,
} from "@avplatform/ui/dropdown-menu";
import {
  DotsThreeIcon,
  PencilSimpleIcon,
  PlusIcon,
  SlidersHorizontalIcon,
} from "@phosphor-icons/react";
import { type ReactNode, useState } from "react";

import { PROJECT_NAME_MAX_LENGTH } from "../constants/chat-name.constant";
import { useInlineEditFocusGuard } from "../hooks/useInlineEditFocusGuard.hook";
import type { ChatHistoryProject } from "./ChatHistory";
import { ChatNameInput } from "./ChatNameInput";

type ChatProjectFilterProps = {
  projects: readonly ChatHistoryProject[];
  activeProjectId: string | null;
  onChange: (projectId: string | null) => void;
  onCreate?: (name: string) => void;
  onRename?: (projectId: string, name: string) => void;
  onEdit?: (project: ChatHistoryProject) => void;
  onDelete?: (project: ChatHistoryProject) => void;
};

type ProjectEdit = { mode: "create" } | { mode: "rename"; projectId: string };

const PROJECT_INPUT_CLASS = "h-7 w-32 shrink-0 px-2.5 text-xs";

/** The history panel's project pills, with a menu to rename or delete the selected project and a button to add one. */
export const ChatProjectFilter = ({
  projects,
  activeProjectId,
  onChange,
  onCreate,
  onRename,
  onEdit,
  onDelete,
}: ChatProjectFilterProps) => {
  const [edit, setEdit] = useState<ProjectEdit | null>(null);
  const focusGuard = useInlineEditFocusGuard();

  return (
    <div
      role="group"
      aria-label="Filter by project"
      className="flex items-center gap-1.5 overflow-x-auto px-3 pb-3 [scrollbar-width:none]"
    >
      <FilterPill active={activeProjectId === null} onClick={() => onChange(null)}>
        All chats
      </FilterPill>
      {projects.map((project) =>
        edit?.mode === "rename" && edit.projectId === project.id ? (
          <ChatNameInput
            key={project.id}
            initialName={project.name}
            label="Rename project"
            maxLength={PROJECT_NAME_MAX_LENGTH}
            placeholder="Project name"
            className={PROJECT_INPUT_CLASS}
            onDone={(name) => {
              setEdit(null);
              if (name && name !== project.name) onRename?.(project.id, name);
            }}
          />
        ) : (
          <div key={project.id} className="flex shrink-0 items-center gap-0.5">
            <FilterPill
              active={activeProjectId === project.id}
              onClick={() => onChange(project.id)}
            >
              {project.name}
            </FilterPill>
            {activeProjectId === project.id && (onRename || onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label={`Options for ${project.name}`}
                  className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <DotsThreeIcon weight="bold" className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="flex min-w-40 max-w-xs flex-col"
                  onCloseAutoFocus={focusGuard.onCloseAutoFocus}
                >
                  {onRename && (
                    <SimpleDDMenuItem
                      content="Rename"
                      Icon={PencilSimpleIcon}
                      onSelect={() => {
                        focusGuard.markEditing();
                        setEdit({ mode: "rename", projectId: project.id });
                      }}
                    />
                  )}
                  {onEdit && (
                    <SimpleDDMenuItem
                      content="Project settings"
                      Icon={SlidersHorizontalIcon}
                      onSelect={() => onEdit(project)}
                    />
                  )}
                  {onDelete && <DeleteDDMenuItem onSelect={() => onDelete(project)} />}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ),
      )}
      {onCreate &&
        (edit?.mode === "create" ? (
          <ChatNameInput
            label="Project name"
            maxLength={PROJECT_NAME_MAX_LENGTH}
            placeholder="Project name"
            className={PROJECT_INPUT_CLASS}
            onDone={(name) => {
              setEdit(null);
              if (name) onCreate(name);
            }}
          />
        ) : (
          <button
            type="button"
            aria-label="New project"
            title="New project"
            onClick={() => setEdit({ mode: "create" })}
            className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-line text-muted-foreground transition-colors hover:bg-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <PlusIcon className="size-3.5" />
          </button>
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
    className="h-7 max-w-40 shrink-0 truncate rounded-lg border border-line px-2.5 text-xs text-ink-2 transition-colors hover:bg-hover aria-pressed:border-ink aria-pressed:font-medium aria-pressed:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
  >
    {children}
  </button>
);
