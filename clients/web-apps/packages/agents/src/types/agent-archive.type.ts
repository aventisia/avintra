import type { QueryKey } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";

/** The agent an archive action applies to. */
export type AgentArchiveTarget = {
  id: string;
  name: string;
  isPublished: boolean;
};

/** What the calling app supplies to reach the backend. */
export type ArchiveAgentRequestContext = {
  /** The app's configured axios instance, so its interceptors and headers still apply. */
  client: AxiosInstance;
  /** Builds the space-scoping headers for each request. */
  getSpaceHeaders: () => Record<string, string>;
};

export type UseArchiveAgentActionOptions = ArchiveAgentRequestContext & {
  /** Query keys refreshed after the server accepts an archive or unarchive. */
  refreshQueryKeys: QueryKey[];
  /** Lets the calling app update its own state once the server accepts the change. */
  onArchiveSettled?: (flowId: string, archive: boolean) => void;
};
