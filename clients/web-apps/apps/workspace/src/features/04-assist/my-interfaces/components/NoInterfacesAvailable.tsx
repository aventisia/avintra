import { BrowserIcon } from "@phosphor-icons/react";

export function NoInterfacesAvailable() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-4*var(--header-height))] gap-4 text-center">
      <div className="relative w-16 h-16 flex items-center justify-center opacity-65">
        <BrowserIcon className="h-16 w-16 text-gray-400" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-lg font-medium text-foreground">No interfaces assigned</h3>
        <p className="text-sm text-muted-foreground max-w-96 leading-relaxed">
          You don't have any interfaces assigned to you. Please contact your administrator to
          request access.
        </p>
      </div>
    </div>
  );
}
