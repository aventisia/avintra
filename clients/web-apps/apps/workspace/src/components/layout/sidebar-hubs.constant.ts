import {
  BuildingsIcon,
  ChatsCircleIcon,
  HardDrivesIcon,
  SlidersHorizontalIcon,
  TreeStructureIcon,
} from "@phosphor-icons/react";

import type { SidebarHub } from "./sidebar-hub.type";

/** Hubs shown as single sidebar entries, in sidebar order. */
export const sidebarHubs: SidebarHub[] = [
  { id: "configure", name: "Configure", Icon: SlidersHorizontalIcon },
  { id: "assist", name: "Assist", Icon: ChatsCircleIcon },
  { id: "orchestrator", name: "Orchestrator", Icon: HardDrivesIcon },
];

/** Hubs of the admin sections, opened from the account menu instead of the sidebar. */
export const adminHubs: SidebarHub[] = [
  { id: "admin", name: "Admin console", Icon: BuildingsIcon },
  { id: "multi-tenant", name: "Multi-tenant console", Icon: TreeStructureIcon },
];
