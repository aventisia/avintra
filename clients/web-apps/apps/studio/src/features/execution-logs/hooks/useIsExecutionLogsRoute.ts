import { useMatch } from "react-router-dom";

import { EXECUTION_LOG_PATH } from "../constants/execution-log-path.constant";

export const useIsExecutionLogsRoute = (): boolean => useMatch(EXECUTION_LOG_PATH) !== null;
