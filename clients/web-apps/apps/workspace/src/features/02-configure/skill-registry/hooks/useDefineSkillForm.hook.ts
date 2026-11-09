import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { useCheckAvailability } from "@avplatform/ui/hooks";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { type CrudActionType } from "@avplatform/ui/types";
import { getUserDisplayName } from "@avplatform/ui/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { ResourceAccessTypeEnum } from "@/features/resource-user-access/enums/resource-access-type-enum";

import { isSkillNameAvailable } from "../apis/skill-registry.apis";
import { skillNameSchema, skillZodSchema } from "../constants/skill-zod-schema.constant";
import { SkillTableDto } from "../dtos/skill-table.dto";
import { useTableTab } from "./useTableTab.hook";

interface UseDefineSkillFormOptions {
  rowId: string;
  crudAction: CrudActionType;
}

/**
 * Custom hook for defining a skill form.
 */
export const useDefineSkillForm = ({ rowId, crudAction }: UseDefineSkillFormOptions) => {
  // Set skill name state (required for availability check)
  const [skillName, setSkillName] = useState("");

  const { setIsDirty } = useCrudDialogDirty();

  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Get query client
  const queryClient = useQueryClient();

  // Define form with zod schema
  const form = useForm<z.infer<typeof skillZodSchema>>({
    resolver: zodResolver(skillZodSchema),
    defaultValues: {
      id: "",
      name: "",
      description: "",
      isDisabled: false,
      createdBy: getUserDisplayName(userSession),
      createdOn: new Date(),
      lastModifiedBy: getUserDisplayName(userSession),
      lastModifiedOn: new Date(),
    },
  });

  // Destructor form values and methods
  const {
    formState: { isDirty },
  } = form;

  // Use this in place DATA_QUERY_KEY to handle Personal/Shared tabs list
  const { queryKey } = useTableTab();

  // Fetch skill data when rowId changes
  useEffect(() => {
    // Get skill data from the merged Personal/Shared list in the cache
    const skillDataList = queryClient.getQueryData<{
      data: SkillTableDto[];
    }>(queryKey);

    // Get skill data by id
    const skillData = skillDataList?.data?.find((item) => item.id === rowId);

    // Set skill name
    setSkillName(skillData?.name ?? "");

    // Set skill data to form
    form.reset({
      id: rowId,
      name: skillData?.name ?? "",
      description: skillData?.description ?? "",
      isDisabled: skillData?.isDisabled ?? false,
      createdBy: skillData?.createdBy ?? getUserDisplayName(userSession),
      createdOn: skillData?.createdOn ? new Date(skillData?.createdOn) : new Date(),
      lastModifiedBy: skillData?.lastModifiedBy ?? getUserDisplayName(userSession),
      lastModifiedOn: skillData?.lastModifiedOn ? new Date(skillData?.lastModifiedOn) : new Date(),
    });
  }, [rowId, form, queryClient, userSession, queryKey]);

  // Get check availability state and methods
  const {
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    setAvailabilityMessage,
  } = useCheckAvailability<z.infer<typeof skillZodSchema>, z.ZodString>({
    defaultInputValue: skillName,
    fieldName: "name",
    form,
    fieldSchema: skillNameSchema,
    checkAvailabilityAPIFn: isSkillNameAvailable,
  });

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof skillZodSchema>) => {
    return {
      id: formData.id || undefined,
      name: formData.name,
      description: formData.description,
      isDisabled: formData.isDisabled,
      createdBy: formData.createdBy,
      createdOn: formData.createdOn?.toISOString(),
      lastModifiedBy: formData.lastModifiedBy,
      lastModifiedOn: formData.lastModifiedOn?.toISOString(),
      accessLevel: ResourceAccessTypeEnum.Personal,
      isTenantWideAccess: false,
      isGlobal: false,
      isActive: true,
      fileCount: 0,
    };
  };

  // Save the form dirty state
  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  // Reset availability message when dialog closes
  useEffect(() => {
    return () => {
      setAvailabilityMessage(null);
    };
  }, [setAvailabilityMessage]);

  // Return form and methods
  return {
    form,
    isDirty,
    crudAction,
    refineFormData,
    isAvailable,
    availabilityMessage,
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
  };
};
