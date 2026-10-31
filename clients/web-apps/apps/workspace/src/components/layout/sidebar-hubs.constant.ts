import {
  ActivityIcon,
  Building2Icon,
  NetworkIcon,
  ServerIcon,
  SlidersHorizontalIcon,
} from "lucide-react";

import type { SidebarHub } from "./sidebar-hub.type";

/** Hubs shown as single sidebar entries, in sidebar order. */
export const sidebarHubs: SidebarHub[] = [
  { id: "activity", name: "Activity", Icon: ActivityIcon },
  { id: "configure", name: "Configure", Icon: SlidersHorizontalIcon },
  { id: "operations", name: "Operations", Icon: ServerIcon },
];

/** Hubs of the admin sections, opened from the account menu instead of the sidebar. */
export const adminHubs: SidebarHub[] = [
  { id: "admin", name: "Admin console", Icon: Building2Icon },
  { id: "multi-tenant", name: "Multi-tenant console", Icon: NetworkIcon },
];
