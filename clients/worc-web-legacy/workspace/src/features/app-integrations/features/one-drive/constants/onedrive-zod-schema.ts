import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";

export const oneDriveIntegrationZodSchema = z.object({
  id: z.string().readonly(),
  oAuthRedirectURL: z.string().readonly(),
  authorizationURL: z.string(),
  accessTokenURL: z.string(),
  clientId: z.string().min(1, { message: reqError("Client ID") }),
  clientSecret: z.string().min(1, { message: reqError("Client Secret") }),
});
