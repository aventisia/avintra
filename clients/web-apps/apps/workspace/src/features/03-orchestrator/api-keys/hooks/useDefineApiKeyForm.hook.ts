import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { type CrudActionType } from "@avplatform/ui/types";
import { toDateOrNull } from "@avplatform/ui/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { getApiKey } from "../apis/api-key.apis";
import { apiKeyZodSchema } from "../constants/api-key-zod-schema";
import { buildDefaultPermissions, normalizePermissions } from "../utils/api-key-permissions.util";

interface UseDefineApiKeyFormOptions {
  rowId: string;
  crudAction: CrudActionType;
}

/**
 * Custom hook for defining an API key form.
 */
export const useDefineApiKeyForm = ({ rowId, crudAction }: UseDefineApiKeyFormOptions) => {
  const { setIsDirty } = useCrudDialogDirty();
  const [isRevoked, setIsRevoked] = useState(false);

  // Define form with zod schema
  const form = useForm<z.infer<typeof apiKeyZodSchema>>({
    resolver: zodResolver(apiKeyZodSchema),
    mode: "onChange",
    defaultValues: {
      id: "",
      name: "",
      expiresAt: null,
      permissions: buildDefaultPermissions(),
      keyPrefix: null,
      lastUsedAt: null,
      isRevoked: false,
      createdBy: null,
      createdOn: null,
      lastModifiedBy: null,
      lastModifiedOn: null,
    },
  });

  // Destructure form's methods
  const {
    formState: { isDirty, isValid },
  } = form;

  // Fetch API key data when rowId changes
  useEffect(() => {
    let isActive = true;

    const resetApiKeyForm = async () => {
      if (crudAction === "update" && rowId) {
        try {
          const response = await getApiKey(rowId);

          if (!isActive) {
            return;
          }

          const apiKeyData = response?.data;

          form.reset({
            id: apiKeyData?.id ?? rowId,
            name: apiKeyData?.name ?? "",
            expiresAt: toDateOrNull(apiKeyData?.expiresAt),
            permissions: normalizePermissions(apiKeyData?.permissions),
            keyPrefix: apiKeyData?.keyPrefix ?? null,
            lastUsedAt: apiKeyData?.lastUsedAt ?? null,
            isRevoked: apiKeyData?.isRevoked ?? false,
            createdBy: apiKeyData?.createdBy ?? null,
            createdOn: apiKeyData?.createdOn ?? null,
            lastModifiedBy: apiKeyData?.lastModifiedBy ?? null,
            lastModifiedOn: apiKeyData?.lastModifiedOn ?? null,
          });

          setIsRevoked(apiKeyData?.isRevoked ?? false);
        } catch {
          if (!isActive) {
            return;
          }

          form.reset();
        }

        return;
      }

      form.reset();
    };

    resetApiKeyForm();

    return () => {
      isActive = false;
    };
  }, [rowId, crudAction, form]);

  // Save the form dirty state
  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  // Return form and methods
  return {
    form,
    isDirty,
    isValid,
    isRevoked,
  };
};
