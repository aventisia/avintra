import type { TenantPreferencesDto } from "../dtos/tenant-prefrences-dto.ee";

/** The tenant preferences payload accepted by the update endpoint. */
export type TenantPreferencesUpdatePayload = Omit<
  TenantPreferencesDto,
  "isSSOEnabled" | "isSSOAvailable"
>;
