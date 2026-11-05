import { BrowserIcon } from "@phosphor-icons/react";

/**
 * Renders the placeholder shown in the right pane when no interface is selected.
 */
export const InterfaceNoSelection = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center opacity-65">
        <BrowserIcon className="h-16 w-16 text-gray-400" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-lg font-medium text-foreground">Select an interface</h3>
        <p className="text-sm text-muted-foreground">
          Choose a UI from the list to preview it here.
        </p>
      </div>
    </div>
  );
};
