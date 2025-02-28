import {
  alphaNumericError,
  maxLenError,
  reqError,
} from "@/react-toolkit/utils/error-message-list";
import { alphaNumericRegex } from "@/react-toolkit/utils/regex-list";
import { z } from "zod";

/**
 * Represents the Zod object's item schema for a machine name.
 */
export const machineNameSchema = z
  .string()
  .min(1, { message: reqError("Machine name") })
  .max(255, { message: maxLenError("Machine name", 255) })
  .regex(alphaNumericRegex, {
    message: alphaNumericError("Machine name"),
  });

/**
 * Represents the Zod schema for a machine.
 */
export const machineZodSchema = z.object({
  id: z.string(),
  tenantId: z.optional(z.string()),
  type: z.optional(z.string({ message: reqError("Machine type") })),
  name: z.string({ message: reqError("Machine unique name") }),
  environment: z.string(),
  ipAddress: z.string().min(1, { message: reqError("IP Address") }),
  hostname: z.string().min(1, { message: reqError("Host Name") }),
  isDisabled: z.boolean(),
  isAvailable: z.boolean(),
  status: z.string(),
  currentTask: z.string(),

  // Read (view) only fields  
  createdBy: z.string(),
  createdOn: z.date(),
  lastCheckedIn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});
