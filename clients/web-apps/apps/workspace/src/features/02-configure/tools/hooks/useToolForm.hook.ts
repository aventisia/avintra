import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { type IHttpResponse, TrueFalseResultDto } from "@avplatform/ui/dtos";
import { useCheckAvailability } from "@avplatform/ui/hooks";
import { type CrudActionType } from "@avplatform/ui/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";

import { getToolById, isToolNameAvailable } from "../apis/tools.apis";
import { DETAIL_DATA_QUERY_KEY } from "../constants/tools-table.constants";
import { toolNameSchema, toolZodSchema } from "../constants/tools-zod-schema";
import { ToolDto } from "../dtos/index";
import { ComponentTypeEnum } from "../enums/component-type-enum";
import { useTableTab } from "./useTableTab.hook";

interface UseToolFormOptions {
  rowId: string;
  crudAction: CrudActionType;
}

/**
 * Custom hook for defining a tool form, including loading existing data on edit/read.
 */
export const useToolForm = ({ rowId, crudAction }: UseToolFormOptions) => {
  const [toolName, setToolName] = useState("");
  const { setIsDirty } = useCrudDialogDirty();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof toolZodSchema>>({
    resolver: zodResolver(toolZodSchema),
    defaultValues: {
      id: "",
      name: "",
      description: "",
      type: ComponentTypeEnum.Custom,
      baseUrl: "",
      openApiSpec: "",
      parsedSchema: undefined,
      authenticationType: undefined,
      credentialName: undefined,
      isTenantWideAccess: false,
      isActive: false,
      isVerified: false,
      isDisabled: false,
      accessLevel: ResourceAccessTypeEnum.Owner,
    },
  });

  const {
    formState: { isDirty },
    reset,
  } = form;

  const { queryKey } = useTableTab();

  // Load existing tool data when editing or reading.
  useEffect(() => {
    if (crudAction === "create" || !rowId) {
      reset({
        id: "",
        name: "",
        description: "",
        type: ComponentTypeEnum.Custom,
        baseUrl: "",
        openApiSpec: "",
        parsedSchema: undefined,
        authenticationType: undefined,
        credentialName: undefined,
        isTenantWideAccess: false,
        isActive: false,
        isVerified: false,
        isDisabled: false,
        accessLevel: ResourceAccessTypeEnum.Owner,
      });
      setToolName("");
      return;
    }

    const loadTool = async () => {
      // First try the list cache (Personal/Shared tabs).
      const cachedList = queryClient.getQueryData<{ data: ToolDto[] }>(queryKey);
      const cachedTool = cachedList?.data?.find((item) => item.id === rowId);

      if (cachedTool) {
        reset({
          id: cachedTool.id ?? "",
          name: cachedTool.name ?? "",
          description: cachedTool.description ?? "",
          type: cachedTool.type ?? ComponentTypeEnum.Custom,
          baseUrl: cachedTool.baseUrl ?? "",
          openApiSpec: cachedTool.openApiSpec ?? "",
          parsedSchema: (cachedTool.parsedSchema as Record<string, unknown>) ?? undefined,
          authenticationType: cachedTool.authenticationType ?? undefined,
          credentialName: cachedTool.credentialName ?? undefined,
          isTenantWideAccess: cachedTool.isTenantWideAccess ?? false,
          isActive: cachedTool.isActive ?? false,
          isVerified: cachedTool.isVerified ?? false,
          isDisabled: cachedTool.isDisabled ?? false,
          accessLevel: cachedTool.accessLevel ?? ResourceAccessTypeEnum.Owner,
          createdBy: cachedTool.createdBy,
          createdOn: cachedTool.createdOn,
          lastModifiedBy: cachedTool.lastModifiedBy,
          lastModifiedOn: cachedTool.lastModifiedOn,
        });
        setToolName(cachedTool.name ?? "");
        return;
      }

      // Fallback to API for Library tab or when cache is empty.
      try {
        const response = await getToolById(rowId);
        const tool = response.data;
        if (!tool) return;

        reset({
          id: tool.id ?? "",
          name: tool.name ?? "",
          description: tool.description ?? "",
          type: tool.type ?? ComponentTypeEnum.Custom,
          baseUrl: tool.baseUrl ?? "",
          openApiSpec: tool.openApiSpec ?? "",
          parsedSchema: (tool.parsedSchema as Record<string, unknown>) ?? undefined,
          authenticationType: tool.authenticationType ?? undefined,
          credentialName: tool.credentialName ?? undefined,
          isTenantWideAccess: tool.isTenantWideAccess ?? false,
          isActive: tool.isActive ?? false,
          isVerified: tool.isVerified ?? false,
          isDisabled: tool.isDisabled ?? false,
          accessLevel: tool.accessLevel ?? ResourceAccessTypeEnum.Owner,
          createdBy: tool.createdBy,
          createdOn: tool.createdOn,
          lastModifiedBy: tool.lastModifiedBy,
          lastModifiedOn: tool.lastModifiedOn,
        });
        setToolName(tool.name ?? "");

        // Keep detail cache up to date.
        queryClient.setQueryData([...DETAIL_DATA_QUERY_KEY, rowId], response);
      } catch {
        // Silent fail: form stays empty and the user can retry by reopening.
      }
    };

    loadTool();
  }, [crudAction, rowId, queryClient, queryKey, reset]);

  // Name can only change during create; skip duplicate-name checks on edit/read.
  const checkAvailabilityAPIFn = useMemo(
    () =>
      crudAction === "create"
        ? isToolNameAvailable
        : () =>
            Promise.resolve<IHttpResponse<TrueFalseResultDto>>({
              statusCode: 200,
              message: "",
              data: { result: true },
            }),
    [crudAction],
  );

  const {
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    setAvailabilityMessage,
  } = useCheckAvailability<z.infer<typeof toolZodSchema>, z.ZodString>({
    defaultInputValue: toolName,
    fieldName: "name",
    form,
    fieldSchema: toolNameSchema,
    checkAvailabilityAPIFn,
  });

  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  useEffect(() => {
    return () => {
      setAvailabilityMessage(null);
    };
  }, [setAvailabilityMessage]);

  return {
    form,
    isDirty,
    isAvailable,
    isCheckPending,
    availabilityMessage,
    setAvailabilityMessage,
    handleInputChange,
  };
};
