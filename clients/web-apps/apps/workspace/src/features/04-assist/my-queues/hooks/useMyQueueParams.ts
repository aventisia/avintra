import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { TABS, TabValue } from "../types/my-queue-types";

export const useMyQueueParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get("t") as TabValue | null;
  const queueIdParam = searchParams.get("qid");
  const queueNameParam = searchParams.get("qn");
  const workItemParam = searchParams.get("wid");

  const [tabValue, setTabValue] = useState<TabValue>(
    TABS.includes(tabParam as TabValue) ? tabParam! : "Pending",
  );
  const [queueId, setQueueId] = useState<string | null>(queueIdParam);
  const [queueName, setQueueName] = useState<string | null>(queueNameParam);
  const [workItemId, setWorkItemId] = useState<string | null>(workItemParam);

  const updateParams = useCallback(
    (updates: Partial<Record<string, string>>) => {
      const params = Object.fromEntries(searchParams.entries());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) params[key] = value;
        else delete params[key];
      });

      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    if (tabParam && TABS.includes(tabParam)) {
      setTabValue(tabParam);
    } else {
      updateParams({ t: "Pending" });
    }
  }, [tabParam, updateParams]);

  useEffect(() => {
    setQueueId(queueIdParam);
    setQueueName(queueNameParam);
  }, [queueIdParam, queueNameParam]);

  useEffect(() => {
    setWorkItemId(workItemParam);
  }, [workItemParam]);

  return {
    tabValue,
    setTabValue,
    queueId,
    queueName,
    workItemId,
    setQueueId,
    setQueueName,
    updateParams,
  };
};
