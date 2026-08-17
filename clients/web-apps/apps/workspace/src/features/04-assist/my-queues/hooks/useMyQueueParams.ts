import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { QueueTypesEnum } from "../enums/queue-instance-type-enum";
import { CORE_TABS, TabValue } from "../types/my-queue-types";

export const useMyQueueParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get("t") as TabValue | null;
  const queueIdParam = searchParams.get("qid");
  const queueNameParam = searchParams.get("qn");
  const workItemParam = searchParams.get("wid");
  const queueTypeParam = searchParams.get("qt");

  const [tabValue, setTabValue] = useState<TabValue>(
    tabParam && CORE_TABS.includes(tabParam as (typeof CORE_TABS)[number]) ? tabParam : "Current",
  );
  const [queueId, setQueueId] = useState<string | null>(queueIdParam);
  const [queueName, setQueueName] = useState<string | null>(queueNameParam);
  const [workItemId, setWorkItemId] = useState<string | null>(workItemParam);
  const [queueType, setQueueType] = useState<QueueTypesEnum>(
    queueTypeParam === QueueTypesEnum.Agent ? QueueTypesEnum.Agent : QueueTypesEnum.User,
  );

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
    if (tabParam) {
      setTabValue(tabParam);
    } else {
      updateParams({ t: "Current" });
    }
  }, [tabParam, updateParams]);

  useEffect(() => {
    setQueueId(queueIdParam);
    setQueueName(queueNameParam);
  }, [queueIdParam, queueNameParam]);

  useEffect(() => {
    setWorkItemId(workItemParam);
  }, [workItemParam]);

  useEffect(() => {
    setQueueType(
      queueTypeParam === QueueTypesEnum.Agent ? QueueTypesEnum.Agent : QueueTypesEnum.User,
    );
  }, [queueTypeParam]);

  return {
    tabValue,
    setTabValue,
    queueId,
    queueName,
    workItemId,
    queueType,
    setQueueId,
    setQueueName,
    setQueueType,
    updateParams,
  };
};
