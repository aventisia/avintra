import type { IconProps } from "@avplatform/ui/types";

export type HubId = "configure" | "assist" | "orchestrator" | "admin" | "multi-tenant";

export type SidebarHub = {
  id: HubId;
  name: string;
  Icon: React.ComponentType<IconProps>;
};
