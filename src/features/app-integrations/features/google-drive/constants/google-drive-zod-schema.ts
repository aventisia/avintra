// import { reqError } from "@aventisia/ui/utils";
// import { z } from "zod";

// export const googleDriveIntegrationZodSchema = z.object({
//     id: z.string().readonly(),
//     connectUsing: z.enum(["OAuth2", "service_account"], {
//         errorMap: () => ({ message: reqError("Connect Using") }),
//     }).default("OAuth2"),

//     // OAuth Fields
//     oAuthRedirectURL: z.string().readonly().default("https://n8n.aventisia.com/rest/oauth2-credential/callback"),
//     clientId: z.string().min(1, {message: reqError("Client ID")}),
//     clientSecret: z.string().min(1, {message: reqError("Client Secret")}),

//     // Service account
//     region: z.string().min(1, {message: reqError("Region")}),
//     serviceAccountEmail: z.string().min(1, {message: reqError("Service Account Email")}),
//     privateKey: z.string().min(1, {message: reqError("Private Key")}),
//     impersonateUser: z.boolean().default(false),
//     email: z.string().min(1, {message: reqError("Email")}),
//     httpRequestNode: z.boolean().default(false),
//     scopes: z.string().min(1, {message: reqError("Scopes")})
// })

import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";

export const googleDriveIntegrationZodSchema = z
  .object({
    id: z.string().readonly(),
    connectUsing: z
      .enum(["OAuth2", "service_account"], {
        errorMap: () => ({ message: reqError("Connect Using") }),
      })
      .default("OAuth2"),

    // OAuth2 fields
    oAuthRedirectURL: z
      .string()
      .readonly()
      .default("https://n8n.aventisia.com/rest/oauth2-credential/callback"),
    clientId: z
      .string()
      .min(1, { message: reqError("Client ID") })
      .optional(),
    clientSecret: z
      .string()
      .min(1, { message: reqError("Client Secret") })
      .optional(),

    // Service account fields
    region: z
      .string()
      .min(1, { message: reqError("Region") })
      .optional(),
    serviceAccountEmail: z
      .string()
      .min(1, { message: reqError("Service Account Email") })
      .optional(),
    privateKey: z
      .string()
      .min(1, { message: reqError("Private Key") })
      .optional(),

    impersonateUser: z.boolean().default(false),
    email: z
      .string()
      .min(1, { message: reqError("Email") })
      .optional(),

    httpRequestNode: z.boolean().default(false),
    scopes: z
      .string()
      .min(1, { message: reqError("Scopes") })
      .optional(),
  })
  .superRefine((data, ctx) => {
    // OAuth2 Validation
    if (data.connectUsing === "OAuth2") {
      if (!data.clientId) {
        ctx.addIssue({
          path: ["clientId"],
          message: reqError("Client ID"),
          code: z.ZodIssueCode.custom,
        });
      }
      if (!data.clientSecret) {
        ctx.addIssue({
          path: ["clientSecret"],
          message: reqError("Client Secret"),
          code: z.ZodIssueCode.custom,
        });
      }
    }

    // Service Account Validation
    if (data.connectUsing === "service_account") {
      if (!data.region) {
        ctx.addIssue({
          path: ["region"],
          message: reqError("Region"),
          code: z.ZodIssueCode.custom,
        });
      }
      if (!data.serviceAccountEmail) {
        ctx.addIssue({
          path: ["serviceAccountEmail"],
          message: reqError("Service Account Email"),
          code: z.ZodIssueCode.custom,
        });
      }
      if (!data.privateKey) {
        ctx.addIssue({
          path: ["privateKey"],
          message: reqError("Private Key"),
          code: z.ZodIssueCode.custom,
        });
      }

      // If impersonateUser is true, email is required
      if (data.impersonateUser && !data.email) {
        ctx.addIssue({
          path: ["email"],
          message: reqError("Email"),
          code: z.ZodIssueCode.custom,
        });
      }

      // If httpRequestNode is true, scopes is required
      if (data.httpRequestNode && !data.scopes) {
        ctx.addIssue({
          path: ["scopes"],
          message: reqError("Scopes"),
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });
