import { maxLenError, reqError } from "@avplatform/ui/utils";
import { z } from "zod";

import { VaultCredentialDto } from "../../dtos/vaults-table-dto";

/**
 * Supported authentication types for the CustomApiTool vault credential.
 */
export enum CustomApiToolAuthTypeEnum {
  ApiKeyHeader = "ApiKeyHeader",
  ApiKeyQuery = "ApiKeyQuery",
  Bearer = "Bearer",
  Basic = "Basic",
}

/**
 * Zod schema for a CustomApiTool credential.
 *
 * Only the fields relevant to the selected authentication type are validated.
 */
const customApiToolBaseSchema = z.object({
  name: z
    .string()
    .min(1, { message: reqError("Name") })
    .max(255, { message: maxLenError("Name", 255) }),
  description: z.string().optional(),
  authenticationType: z.nativeEnum(CustomApiToolAuthTypeEnum, {
    message: reqError("Authentication type"),
  }),
  bearerToken: z.string().optional(),
  basicUsername: z.string().optional(),
  basicPassword: z.string().optional(),
  apiKeyHeaderName: z.string().optional(),
  apiKeyHeaderValue: z.string().optional(),
  apiKeyQueryName: z.string().optional(),
  apiKeyQueryValue: z.string().optional(),
  isDisabled: z.boolean().optional(),
});

export const customApiToolSchema = customApiToolBaseSchema.superRefine((values, ctx) => {
  const addRequiredError = (path: string, fieldName: string) => {
    ctx.addIssue({
      code: z.ZodIssueCode.too_small,
      type: "string",
      minimum: 1,
      inclusive: true,
      message: reqError(fieldName),
      path: [path],
    });
  };

  if (values.authenticationType === CustomApiToolAuthTypeEnum.Bearer) {
    if (!values.bearerToken?.trim()) addRequiredError("bearerToken", "Token");
  }

  if (values.authenticationType === CustomApiToolAuthTypeEnum.Basic) {
    if (!values.basicUsername?.trim()) addRequiredError("basicUsername", "Username");
    if (!values.basicPassword?.trim()) addRequiredError("basicPassword", "Password");
  }

  if (values.authenticationType === CustomApiToolAuthTypeEnum.ApiKeyHeader) {
    if (!values.apiKeyHeaderName?.trim()) addRequiredError("apiKeyHeaderName", "Header name");
    if (!values.apiKeyHeaderValue?.trim()) addRequiredError("apiKeyHeaderValue", "API key");
  }

  if (values.authenticationType === CustomApiToolAuthTypeEnum.ApiKeyQuery) {
    if (!values.apiKeyQueryName?.trim()) addRequiredError("apiKeyQueryName", "Parameter name");
    if (!values.apiKeyQueryValue?.trim()) addRequiredError("apiKeyQueryValue", "API key");
  }
});

/**
 * Form values inferred from the CustomApiTool schema.
 */
export type CustomApiToolFormValues = z.infer<typeof customApiToolSchema>;

/**
 * Vault form schema for CustomApiTool. Includes the app selector field used by
 * the shared vault form wrapper.
 */
export const customApiToolVaultSchema = customApiToolBaseSchema.extend({
  selectedType: z.object({ label: z.string(), value: z.string() }).optional(),
});

/**
 * Vault form schema for CustomApiTool.
 */
export const getCustomApiToolVaultSchema = () =>
  customApiToolBaseSchema.extend({
    selectedType: z.object({ label: z.string(), value: z.string() }).optional(),
  });

export type CustomApiToolVaultFormValues = z.infer<typeof customApiToolVaultSchema>;

/**
 * Default form values for a new CustomApiTool credential.
 */
export const getCustomApiToolDefaultValues = (
  overrides?: Partial<CustomApiToolVaultFormValues>,
): CustomApiToolVaultFormValues => {
  const values: CustomApiToolVaultFormValues = {
    name: "",
    description: "",
    authenticationType: undefined as unknown as CustomApiToolAuthTypeEnum,
    bearerToken: "",
    basicUsername: "",
    basicPassword: "",
    apiKeyHeaderName: "",
    apiKeyHeaderValue: "",
    apiKeyQueryName: "",
    apiKeyQueryValue: "",
    isDisabled: false,
    selectedType: undefined,
  };

  return { ...values, ...overrides };
};

/**
 * Builds the CustomApiTool payload data object from form values.
 *
 * Returns { Type, Parameters } in PascalCase to match the backend DTO contract
 * and the EmailClient credential sample.
 */
export const buildCustomApiToolPayload = (
  values: CustomApiToolFormValues,
): Record<string, unknown> => {
  const { authenticationType } = values;

  switch (authenticationType) {
    case CustomApiToolAuthTypeEnum.Bearer:
      return {
        Type: CustomApiToolAuthTypeEnum.Bearer,
        Parameters: {
          token: values.bearerToken?.trim() ?? "",
        },
      };
    case CustomApiToolAuthTypeEnum.Basic:
      return {
        Type: CustomApiToolAuthTypeEnum.Basic,
        Parameters: {
          username: values.basicUsername?.trim() ?? "",
          password: values.basicPassword?.trim() ?? "",
        },
      };
    case CustomApiToolAuthTypeEnum.ApiKeyHeader:
      return {
        Type: CustomApiToolAuthTypeEnum.ApiKeyHeader,
        Parameters: {
          headerName: values.apiKeyHeaderName?.trim() ?? "",
          apiKey: values.apiKeyHeaderValue?.trim() ?? "",
        },
      };
    case CustomApiToolAuthTypeEnum.ApiKeyQuery:
      return {
        Type: CustomApiToolAuthTypeEnum.ApiKeyQuery,
        Parameters: {
          parameterName: values.apiKeyQueryName?.trim() ?? "",
          apiKey: values.apiKeyQueryValue?.trim() ?? "",
        },
      };
    default:
      return { Type: authenticationType, Parameters: {} };
  }
};

/**
 * Maps saved CustomApiTool vault data back into form field values.
 */
export const mapCustomApiToolDataToFormValues = (
  vaultData?: VaultCredentialDto,
): Partial<CustomApiToolFormValues> => {
  if (!vaultData) return {};

  const data = (vaultData.data ?? {}) as {
    Type?: CustomApiToolAuthTypeEnum;
    Parameters?: Record<string, string>;
  };
  const parameters = data.Parameters ?? {};
  const authType = data.Type;

  return {
    name: vaultData.name,
    description: vaultData.description,
    authenticationType: authType,
    bearerToken: authType === CustomApiToolAuthTypeEnum.Bearer ? parameters.token : "",
    basicUsername: authType === CustomApiToolAuthTypeEnum.Basic ? parameters.username : "",
    basicPassword: authType === CustomApiToolAuthTypeEnum.Basic ? parameters.password : "",
    apiKeyHeaderName:
      authType === CustomApiToolAuthTypeEnum.ApiKeyHeader ? parameters.headerName : "",
    apiKeyHeaderValue: authType === CustomApiToolAuthTypeEnum.ApiKeyHeader ? parameters.apiKey : "",
    apiKeyQueryName:
      authType === CustomApiToolAuthTypeEnum.ApiKeyQuery ? parameters.parameterName : "",
    apiKeyQueryValue: authType === CustomApiToolAuthTypeEnum.ApiKeyQuery ? parameters.apiKey : "",
    isDisabled: vaultData.isDisabled ?? false,
  };
};
