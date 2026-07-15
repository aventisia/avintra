import { useDTCrudDialogStore } from "@aventisia/ui/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

import {
  DATA_QUERY_KEY,
  JobInsertDto,
  JobPriorityEnum,
  JobRecordDto,
  JobStatusEnum,
  JobUpdateDto,
  JobsTableRowDto,
  TriggerTypesEnum,
  getJob,
  jobInsertZodSchema,
} from "..";

const toJsonEditorValue = (value?: Record<string, unknown>) => {
  if (!value) return "{}";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "{}";
  }
};

const parseJsonEditorValue = (value?: string) => {
  if (!value || value.trim() === "") return undefined;
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return undefined;
  }
};

export const useDefineJobForm = () => {
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const {
    crudDialogOptions: { rowId, crudAction },
    toggleFormDirty,
    setShowDialog,
  } = useDTCrudDialogStore(
    useShallow((state) => ({
      crudDialogOptions: state.crudDialogOptions,
      setShowDialog: state.setShowDialog,
      toggleFormDirty: state.toggleFormDirty,
    })),
  );

  const fullName =
    `${userSession?.firstName ?? "FN"} ${userSession?.lastName ?? "LN"}`.trim();
  const userIdentifier = userSession?.email ?? "USER_NOT_FOUND";

  const form = useForm<z.infer<typeof jobInsertZodSchema>>({
    resolver: zodResolver(jobInsertZodSchema),
    defaultValues: {
      id: "",
      flowVersionId: "",
      triggerType: TriggerTypesEnum.Manual,
      priority: JobPriorityEnum.Normal,
      status: JobStatusEnum.Created,
      retryCount: 0,
      createdByName: fullName,
      createdById: userIdentifier,
      executionLocation: "Cloud",
      remarks: "",
      jobInputData: "{}",
      jobOutputData: "{}",
      lastNodeLog: "{}",
    },
  });

  const {
    formState: { isDirty },
  } = form;

  const { data: jobDataById } = useQuery({
    queryKey: [...DATA_QUERY_KEY, "record", rowId],
    queryFn: () => getJob(rowId),
    enabled: !!rowId && crudAction !== "create",
  });

  useEffect(() => {
    const rowData = jobDataById?.data as
      | JobRecordDto
      | JobsTableRowDto
      | undefined;

    form.reset({
      id: rowData?.id ?? rowId,
      flowVersionId: rowData?.flowVersionId ?? "",
      triggerType: rowData?.triggerType ?? TriggerTypesEnum.Manual,
      priority: rowData?.priority ?? JobPriorityEnum.Normal,
      status: rowData?.status ?? JobStatusEnum.Created,
      retryCount: rowData?.retryCount ?? 0,
      createdByName: rowData?.createdByName ?? fullName,
      createdById:
        (rowData as JobRecordDto | undefined)?.createdById ?? userIdentifier,
      executionLocation: rowData?.executionLocation ?? "Cloud",
      remarks: rowData?.remarks ?? "",
      jobInputData: toJsonEditorValue(
        (rowData as JobRecordDto | undefined)?.jobInputData,
      ),
      jobOutputData: toJsonEditorValue(
        (rowData as JobRecordDto | undefined)?.jobOutputData,
      ),
      lastNodeLog: toJsonEditorValue(
        (rowData as JobRecordDto | undefined)?.lastNodeLog,
      ),
    });
  }, [crudAction, form, fullName, jobDataById?.data, rowId, userIdentifier]);

  const refineFormData = (
    formData: z.infer<typeof jobInsertZodSchema>,
  ): JobInsertDto | JobUpdateDto => {
    if (crudAction === "create") {
      return {
        flowVersionId: formData.flowVersionId,
        triggerType: formData.triggerType,
        priority: formData.priority,
        createdByName: formData.createdByName || fullName,
        createdById: formData.createdById || userIdentifier,
        executionLocation: formData.executionLocation,
        jobInputData: parseJsonEditorValue(formData.jobInputData),
      };
    }

    return {
      id: formData.id,
      status: formData.status,
      priority: formData.priority,
      remarks: formData.remarks,
    };
  };

  useEffect(() => {
    toggleFormDirty(isDirty);
  }, [isDirty, toggleFormDirty]);

  return {
    form,
    rowId,
    crudAction,
    isDirty,
    setShowDialog,
    refineFormData,
  };
};
