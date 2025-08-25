import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { oneDriveIntegrationZodSchema } from "../constants/onedrive-zod-schema";
import { useEffect } from "react";
import { useAvailableIntegrationsDialogStore } from "@/features/app-integrations/store/available-integrations-dialog";


export const useOneDriveIntegrationForm = () => {
      const { toggleFormDirty } = useAvailableIntegrationsDialogStore();
    
    const form = useForm<z.infer<typeof oneDriveIntegrationZodSchema>>({
      resolver: zodResolver(oneDriveIntegrationZodSchema),
      defaultValues: {
        id: "",
        oAuthRedirectURL: "https://n8n.aventisia.com/rest/oauth2-credential/callback",
        authorizationURL: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
        accessTokenURL: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
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


    return {form, isSubmitting, isDirty, control}
}