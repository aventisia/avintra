import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  CLOSING_JOB_STATUSES,
  DATA_QUERY_KEY,
  JobPriorityEnum,
  JobStatusEnum,
  JobUpdateDto,
  type JobUpdateFormData,
  JobsTableRowDto,
  jobUpdateZodSchema,
} from "..";

interface UseDefineJobUpdateFormOptions {
  rowId: string;
}

/**
 * Custom hook for defining the update job form.
 *
 * Row data for update is read from the existing jobs list cache (queryClient)
 * instead of fetching it again from the server.
 */
export const useDefineJobUpdateForm = ({ rowId }: UseDefineJobUpdateFormOptions) => {
  const { setIsDirty } = useCrudDialogDirty();
  const queryClient = useQueryClient();

  const form = useForm<JobUpdateFormData>({
    resolver: zodResolver(jobUpdateZodSchema),
    mode: "onChange",
    defaultValues: {
      id: "",
      priority: JobPriorityEnum.Normal,
      remarks: "",
      isClosingStatusEnabled: false,
      closingStatus: undefined,
    },
  });

  const {
    formState: { isDirty, isValid },
  } = form;

  useEffect(() => {
    let isActive = true;

    const resetJobForm = () => {
      const cachedJobsList = queryClient.getQueryData<{ data: JobsTableRowDto[] }>([
        ...DATA_QUERY_KEY,
      ]);
      const rowData = cachedJobsList?.data?.find((job) => job.id === rowId);

      const isClosingStatusEnabled =
        !!rowData?.status &&
        CLOSING_JOB_STATUSES.includes(rowData.status as JobStatusEnum) &&
        rowData?.endTimeStamp != null;
      const closingStatus = isClosingStatusEnabled ? (rowData?.status ?? undefined) : undefined;

      if (!isActive) {
        return;
      }

      form.reset({
        id: rowData?.id ?? rowId,
        priority: rowData?.priority ?? JobPriorityEnum.Normal,
        remarks: rowData?.remarks ?? "",
        isClosingStatusEnabled,
        closingStatus,
      });
    };

    resetJobForm();

    return () => {
      isActive = false;
    };
  }, [form, queryClient, rowId]);

  const refineFormData = (formData: JobUpdateFormData): JobUpdateDto => ({
    id: formData.id,
    priority: formData.priority,
    closingStatus: formData.isClosingStatusEnabled ? formData.closingStatus : undefined,
    remarks:
      formData.isClosingStatusEnabled && formData.remarks ? formData.remarks.trim() : undefined,
  });

  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  return {
    form,
    isDirty,
    isValid,
    refineFormData,
  };
};
