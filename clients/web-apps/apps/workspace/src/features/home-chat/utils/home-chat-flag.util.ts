import { resolveRolloutFlag } from "@avplatform/chat";

/** Whether this build shows Home; `?homeChat=1|0` overrides it per browser. */
export const isHomeChatEnabled = resolveRolloutFlag({
  envValue: import.meta.env.VITE_HOME_CHAT,
  search: window.location.search,
  param: "homeChat",
  getStorage: () => window.localStorage,
});
