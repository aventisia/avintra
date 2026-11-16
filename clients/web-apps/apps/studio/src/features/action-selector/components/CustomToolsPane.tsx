import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { ScrollArea } from "@avplatform/ui/scroll";
import { Tooltip } from "@avplatform/ui/tooltip";
import {
  ArrowLeftIcon,
  CaretRightIcon,
  CircleNotchIcon,
  PlusIcon,
  PuzzlePieceIcon,
} from "@phosphor-icons/react";
import { KeyboardEvent, useMemo, useState } from "react";

import { useUsableToolCatalog } from "@/features/dynamic-config-panel/hooks/useTools.hook";
import { NodeDataType } from "@/types/node-data-type";

import { useAddCustomTool } from "../hooks/useAddCustomTool.hook";
import {
  convertToolOperationsToActions,
  getCustomTools,
  getToolName,
} from "../utils/custom-tool-actions.util";
import ActionsList from "./ActionsList";
import { CustomToolIcon } from "./CustomToolIcon";

type CustomToolsPaneProps = {
  title: string | null;
  backButtonRef: (el: HTMLButtonElement | null) => void;
  onBack: () => void;
  onBackKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
  onSelectNode: (item: NodeDataType) => void;
  rightRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  rightIndex: number;
  onRightPaneKeyDown: (e: KeyboardEvent, index: number, action: NodeDataType) => void;
};

export const CustomToolsPane = ({
  title,
  backButtonRef,
  onBack,
  onBackKeyDown,
  onSelectNode,
  rightRefs,
  rightIndex,
  onRightPaneKeyDown,
}: CustomToolsPaneProps) => {
  const {
    data: catalogResponse,
    isLoading: isCatalogLoading,
    isError: isCatalogError,
  } = useUsableToolCatalog();
  const customTools = useMemo(
    () => getCustomTools(catalogResponse?.data).sort((a, b) => a.name.localeCompare(b.name)),
    [catalogResponse],
  );

  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const selectedTool = useMemo(
    () => customTools.find((tool) => tool.id === selectedToolId) ?? customTools[0] ?? null,
    [customTools, selectedToolId],
  );

  const customToolActions = useMemo(
    () =>
      selectedTool ? convertToolOperationsToActions(selectedTool, selectedTool.operations) : [],
    [selectedTool],
  );

  const { addCustomTool: handleAddCustomTool } = useAddCustomTool();

  return (
    <div className="flex h-full flex-col border-t border-line">
      <div className="flex h-11 shrink-0 items-center gap-1.5 border-b border-line pl-2 pr-2">
        <Button
          ref={backButtonRef}
          variant="ghost"
          size="icon7"
          onClick={onBack}
          onKeyDown={onBackKeyDown}
          aria-label="Go back"
        >
          <ArrowLeftIcon className="size-4" />
        </Button>
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[13px]">
          <button
            type="button"
            tabIndex={-1}
            onClick={onBack}
            className="shrink-0 text-muted-foreground transition-colors hover:text-ink"
          >
            All categories
          </button>
          <CaretRightIcon aria-hidden="true" className="size-3 shrink-0 text-muted-foreground" />
          <h2 className="truncate font-semibold text-ink">{title}</h2>
        </nav>
        <Tooltip content="Add custom tool">
          <Button
            onClick={handleAddCustomTool}
            className="ml-auto gap-1.5 px-2 text-primary-text"
            size="sm"
            variant="ghost"
            aria-label="Add custom tool"
          >
            <PlusIcon className="size-3.5" weight="bold" />
            New tool
          </Button>
        </Tooltip>
      </div>

      {!isCatalogLoading && !isCatalogError && customTools.length === 0 ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-8 text-center">
          <span
            aria-hidden="true"
            className="mb-4 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary-text ring-1 ring-primary/15"
          >
            <PuzzlePieceIcon className="size-6" />
          </span>
          <p className="text-[14px] font-semibold text-ink">Create your first custom tool</p>
          <p className="mt-1 max-w-[30ch] text-[12.5px]/[18px] text-muted-foreground">
            Custom tools let your agents call your own APIs.
          </p>
          <Button onClick={handleAddCustomTool} size="sm" className="mt-4 gap-1.5">
            <PlusIcon className="size-3.5" weight="bold" />
            New tool
          </Button>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,38%)_minmax(0,1fr)] overflow-hidden">
          <div className="flex min-h-0 flex-col border-r border-line bg-sunken/60">
            {isCatalogLoading ? (
              <div className="flex flex-1 items-center justify-center">
                <CircleNotchIcon
                  className="h-4 w-4 animate-spin text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
            ) : isCatalogError ? (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 p-6 text-center">
                <p className="text-body-sm font-semibold text-ink">Couldn’t load custom tools</p>
                <p className="text-body-sm text-muted-foreground">
                  The tool catalog request failed. Close this dialog and try again.
                </p>
              </div>
            ) : (
              <ScrollArea viewportClassName="[&>div]:!block" className="min-h-0 flex-1">
                <div className="p-2" role="listbox" aria-label="Custom tools">
                  {customTools.map((tool) => {
                    const isSelected = tool.id === selectedTool?.id;
                    return (
                      <button
                        key={tool.id}
                        role="option"
                        aria-selected={isSelected}
                        tabIndex={0}
                        onClick={() => setSelectedToolId(tool.id)}
                        className={cn(
                          "mb-0.5 flex h-8 w-full items-center gap-2 rounded-md px-2 text-left outline-none transition-colors focus-visible:shadow-focus",
                          isSelected
                            ? "bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.06)] ring-1 ring-line"
                            : "hover:bg-hover",
                        )}
                      >
                        <CustomToolIcon
                          icon={tool.icon}
                          iconUrl={tool.iconUrl}
                          className="size-4"
                        />
                        <div className="grow overflow-hidden">
                          <div className="flex items-center gap-1.5">
                            <h3
                              className={cn(
                                "truncate text-[13px] text-ink",
                                isSelected ? "font-semibold" : "font-medium",
                              )}
                            >
                              {getToolName(tool)}
                            </h3>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>

          <div className="flex min-h-0 flex-col overflow-hidden bg-surface">
            {selectedTool ? (
              customToolActions.length === 0 ? (
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 p-6 text-center">
                  <p className="text-body-sm font-semibold text-ink">No actions found</p>
                  <p className="text-body-sm text-muted-foreground">
                    This tool’s OpenAPI spec exposes no endpoints yet.
                  </p>
                </div>
              ) : (
                <ScrollArea
                  viewportClassName="[&>div]:!block"
                  className="min-h-0 flex-1"
                  role="tabpanel"
                >
                  <div
                    className="grid grid-cols-[minmax(0,1fr)] gap-0.5 p-2"
                    role="listbox"
                    aria-label="Custom tool actions"
                  >
                    <ActionsList
                      items={customToolActions}
                      nodeSelectionHandler={onSelectNode}
                      rightRefs={rightRefs}
                      rightIndex={rightIndex}
                      handleRightPaneKeyDown={onRightPaneKeyDown}
                      isFocusedPane={false}
                    />
                  </div>
                </ScrollArea>
              )
            ) : (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 p-6 text-center">
                <p className="text-body-sm font-semibold text-ink">Select a tool</p>
                <p className="text-body-sm text-muted-foreground">
                  Choose a custom tool on the left to see its available actions.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
