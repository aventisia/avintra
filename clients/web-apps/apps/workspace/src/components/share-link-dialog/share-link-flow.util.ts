export type ShareLinkState = {
  status: "off" | "creating" | "on" | "stopping";
  link: string | null;
  error: "create" | "stop" | null;
};

export type ShareLinkAction =
  | { type: "create" }
  | { type: "created"; link: string }
  | { type: "createFailed" }
  | { type: "stop" }
  | { type: "stopped" }
  | { type: "stopFailed" };

/** An item already shared starts by fetching its link; an unshared one starts off. */
export const initialShareLinkState = (isShared: boolean): ShareLinkState => ({
  status: isShared ? "creating" : "off",
  link: null,
  error: null,
});

/** Moves a share dialog between off, creating, on and stopping; actions that do not fit the current status are ignored. */
export const shareLinkReducer = (
  state: ShareLinkState,
  action: ShareLinkAction,
): ShareLinkState => {
  switch (action.type) {
    case "create":
      return state.status === "off" ? { status: "creating", link: null, error: null } : state;
    case "created":
      return { status: "on", link: action.link, error: null };
    case "createFailed":
      return { status: "off", link: null, error: "create" };
    case "stop":
      return state.status === "on" ? { ...state, status: "stopping", error: null } : state;
    case "stopped":
      return { status: "off", link: null, error: null };
    case "stopFailed":
      return { ...state, status: "on", error: "stop" };
  }
};
