import { useMatch } from "react-router-dom";

import { AGENT_HISTORY_PATH } from "../constants/agent-history-path.constant";

export const useIsVersionHistoryRoute = (): boolean => useMatch(AGENT_HISTORY_PATH) !== null;
