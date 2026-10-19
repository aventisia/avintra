import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { ScrollArea } from "@avplatform/ui/scroll";
import { Tooltip } from "@avplatform/ui/tooltip";
import { ArrowLeftIcon, Loader2Icon, PlusIcon } from "lucide-react";
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
    <div className="grid h-full grid-cols-[35%_65%] overflow-hidden">
      <div className="flex min-h-0 flex-col border-r bg-background">
        <div className="flex shrink-0 items-center border-b p-2">
          <Button
            ref={backButtonRef}
            variant="ghost"
            size="icon8"
            onClick={onBack}
            onKeyDown={onBackKeyDown}
            className="mr-2 outline-none focus-visible:bg-accent"
            aria-label="Go back"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
          <h2 className="truncate text-sm font-medium">{title}</h2>
          <Tooltip content="Add custom tool">
            <Button
              onClick={handleAddCustomTool}
              className="ml-auto rounded-full"
              size="icon8"
              variant="ghost"
              aria-label="Add custom tool"
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>

        {isCatalogLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2Icon
              className="h-4 w-4 animate-spin text-muted-foreground"
              aria-hidden="true"
            />
          </div>
        ) : isCatalogError ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 p-6 text-center">
            <p className="text-sm font-medium">Couldn’t load custom tools</p>
            <p className="text-sm text-muted-foreground">
              The tool catalog request failed. Close this dialog and try again.
            </p>
          </div>
        ) : customTools.length === 0 ? (
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 p-6 text-center">
            <p className="text-sm font-medium">Create your first custom tool</p>
            <p className="text-sm text-muted-foreground">
              Custom tools let your agents call your own APIs. Click “+” to open the tool builder.
            </p>
          </div>
        ) : (
          <ScrollArea className="min-h-0 flex-1">
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
                      "mb-1 flex w-full items-start gap-3 rounded-lg p-2 text-left outline-none transition-colors",
                      isSelected
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <CustomToolIcon icon={tool.icon} iconUrl={tool.iconUrl} className="mt-0.5" />
                    <div className="grow overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <h3 className="truncate text-xs font-medium text-foreground">
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

      <div className="flex min-h-0 flex-col overflow-hidden bg-background">
        {selectedTool ? (
          customToolActions.length === 0 ? (
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 p-6 text-center">
              <p className="text-sm font-medium">No actions found</p>
              <p className="text-sm text-muted-foreground">
                This tool’s OpenAPI spec exposes no endpoints yet.
              </p>
            </div>
          ) : (
            <ScrollArea className="min-h-0 flex-1" role="tabpanel">
              <div className="p-2" role="listbox" aria-label="Custom tool actions">
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
            <p className="text-sm font-medium">Select a tool</p>
            <p className="text-sm text-muted-foreground">
              Choose a custom tool on the left to see its available actions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
