import { useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import { useCheckAvailability } from "@avplatform/ui/hooks";
import { useUserSessionStore } from "@avplatform/ui/stores";
import { type CrudActionType } from "@avplatform/ui/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { getMergedQueryData } from "@/utils/get-merged-query-data.util";

import { isVaultCredentialNameAvailable } from "../apis/vault-credentials.apis";
import { DATA_QUERY_KEY } from "../constants";
import {
  vaultCredentialNameSchema,
  vaultCredentialZodSchema,
} from "../constants/vault-credential-zod-schema.constant";
import { VaultCredentialDto } from "../dtos/vault-credentials.dto";

interface UseDefineVaultCredentialFormOptions {
  rowId: string;
  crudAction: CrudActionType;
}

/**
 * Custom hook for defining a config form.
 */
export const useDefineVaultCredentialForm = ({
  rowId,
  crudAction,
}: UseDefineVaultCredentialFormOptions) => {
  const [configName, setConfigName] = useState("");

  const { setIsDirty } = useCrudDialogDirty();

  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const queryClient = useQueryClient();

  /* IMPORTANT NOTE: It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled". */
  const form = useForm<z.infer<typeof vaultCredentialZodSchema>>({
    resolver: zodResolver(vaultCredentialZodSchema),
    defaultValues: {
      id: "",
      name: "",
      username: "",
      password: "",
      confirmPassword: "",
      description: "",
      createdBy: userSession?.firstName + " " + userSession?.lastName,
      createdOn: new Date(),
      lastModifiedBy: userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: new Date(),
    },
  });

  const {
    formState: { isDirty },
  } = form;

  useEffect(() => {
    const configsData = getMergedQueryData<VaultCredentialDto>(queryClient, DATA_QUERY_KEY);

    const configData = configsData?.data.find((item) => item.id === rowId);

    setConfigName(configData?.name ?? "");

    form.reset({
      id: rowId,
      name: configData?.name ?? "",

      description: configData?.description,

      isDisabled: configData?.isDisabled ?? false,
      createdBy: configData?.createdBy ?? userSession?.firstName + " " + userSession?.lastName,
      createdOn: configData?.createdOn ? new Date(configData?.createdOn) : new Date(),
      lastModifiedBy:
        configData?.lastModifiedBy ?? userSession?.firstName + " " + userSession?.lastName,
      lastModifiedOn: configData?.lastModifiedOn
        ? new Date(configData?.lastModifiedOn)
        : new Date(),
    });
  }, [rowId, form, queryClient, userSession]);

  const {
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    setAvailabilityMessage,
  } = useCheckAvailability<z.infer<typeof vaultCredentialZodSchema>, z.ZodString>({
    defaultInputValue: configName,
    fieldName: "name",
    form,
    fieldSchema: vaultCredentialNameSchema,
    checkAvailabilityAPIFn: isVaultCredentialNameAvailable,
  });

  const refineFormData = (formData: z.infer<typeof vaultCredentialZodSchema>) => {
    return {
      ...formData,
      tenantId: userSession?.tenantId,
      lastModifiedBy: userSession?.email ?? "",
      lastModifiedOn: new Date().toISOString(),
    };
  };

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
    crudAction,
    refineFormData,
    isAvailable,
    availabilityMessage,
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
  };
};
