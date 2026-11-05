import { Input } from "@avplatform/ui";
import { useDocumentTitle } from "@avplatform/ui/hooks";
import { cn } from "@avplatform/ui/lib";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { Outlet, useParams } from "react-router-dom";

import { useIsMobile } from "@/hooks/useIsMobile";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/react-toolkit/ui/resizable";

import { TABLE_HEADING } from "../constants";
import { useFetchMyInterfaces } from "../hooks/useFetchMyInterfaces.hook";
import {
  MY_INTERFACES_LIST_PANEL_ID,
  MY_INTERFACES_PANE_PANEL_ID,
  getMyInterfacesSplit,
  saveMyInterfacesSplit,
} from "../utils/my-interfaces-split-persistence.util";
import { InterfaceList } from "./InterfaceList";
import { MyInterfacesSkeleton } from "./MyInterfacesSkeleton";
import { NoInterfacesAvailable } from "./NoInterfacesAvailable";

/**
 * Renders the Assist User Interfaces master-detail split with the assigned list on the left and the selected interface pane on the right.
 */
export const MyInterfacesLayout = () => {
  useDocumentTitle(TABLE_HEADING);

  const isMobile = useIsMobile();
  const layoutMode = isMobile ? "stacked" : "split";

  const userEmail = useUserSessionStore((state) => state.userSession?.email ?? "anonymous");
  const [initialSplit] = useState(() => getMyInterfacesSplit(userEmail));

  const { id } = useParams();
  const isInterfaceActive = !!id;

  const { data, isLoading } = useFetchMyInterfaces();
  const interfaces = useMemo(() => data?.data ?? [], [data?.data]);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredInterfaces = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return interfaces;

    return interfaces.filter((uiInterface) => uiInterface.name.toLowerCase().includes(query));
  }, [interfaces, searchTerm]);

  const showList = layoutMode === "split" || (layoutMode === "stacked" && !isInterfaceActive);
  const showPane = layoutMode === "split" || (layoutMode === "stacked" && isInterfaceActive);

  if (isLoading) {
    return <MyInterfacesSkeleton />;
  }

  if (!interfaces.length) {
    return <NoInterfacesAvailable />;
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col space-y-4 md:py-4",
        layoutMode === "stacked" && "h-screen space-y-2",
      )}
    >
      {layoutMode !== "stacked" && (
        <div className="flex w-full items-center justify-between">
          <p className="text-lg font-medium">{TABLE_HEADING}</p>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name..."
              className="h-9 w-[15rem] pl-8"
            />
          </div>
        </div>
      )}

      <div
        className={cn(
          "flex h-[calc(100vh-2.5*var(--header-height))] w-full overflow-hidden rounded-lg border",
          layoutMode === "split" ? "bg-slate-200" : "bg-background",
        )}
      >
        {layoutMode === "split" ? (
          <ResizablePanelGroup
            orientation="horizontal"
            defaultLayout={initialSplit ?? undefined}
            onLayoutChanged={(layout, meta) => {
              if (meta.isUserInteraction) saveMyInterfacesSplit(userEmail, layout);
            }}
            className="min-h-0 flex-1"
          >
            <ResizablePanel
              id={MY_INTERFACES_LIST_PANEL_ID}
              defaultSize="30%"
              minSize="20%"
              collapsible={false}
              className="flex min-h-0 flex-col overflow-hidden bg-background"
            >
              <InterfaceList data={filteredInterfaces} />
            </ResizablePanel>

            <ResizableHandle withHandle className="mr-px w-1.5 bg-transparent" />

            <ResizablePanel
              id={MY_INTERFACES_PANE_PANEL_ID}
              defaultSize="70%"
              minSize="50%"
              collapsible={false}
              className="flex min-h-0 flex-col overflow-hidden bg-background"
            >
              <Outlet />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <>
            <div
              className={cn(
                "flex w-full flex-shrink-0 flex-col md:w-[30%] lg:w-[25%]",
                !showList && "hidden",
              )}
            >
              <InterfaceList data={filteredInterfaces} />
            </div>

            <div
              className={cn(
                "flex w-full flex-shrink-0 flex-col md:w-[70%] lg:w-[75%]",
                !showPane && "hidden",
              )}
            >
              <Outlet />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
