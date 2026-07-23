import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAvailableIntegrationsDialogStore } from "@/features/05-tenant-admin/app-integrations/store/available-integrations-dialog";

import { googleDriveIntegrationZodSchema } from "../constants/google-drive-zod-schema";

export const useGoogleDriveForm = () => {
  const { toggleFormDirty } = useAvailableIntegrationsDialogStore();

  const form = useForm<z.infer<typeof googleDriveIntegrationZodSchema>>({
    resolver: zodResolver(googleDriveIntegrationZodSchema),
    defaultValues: {
      connectUsing: "OAuth2",
      oAuthRedirectURL: "https://n8n.aventisia.com/rest/oauth2-credential/callback",
      clientId: "",
      clientSecret: "",
    },
  });

  const {
    formState: { isSubmitting, isDirty },
    control,
  } = form;

  useEffect(() => {
    toggleFormDirty(isDirty);
  }, [isDirty, toggleFormDirty]);

  return { form, isSubmitting, isDirty, control };
};
