import { reqError } from "@avplatform/ui/utils";
import { z } from "zod";

/**
 * Represents the Zod schema to update a machine.
 * Identity fields (id, hostname, name) are view-only in the edit form and are
 * never submitted to the backend.
 */
export const machineZodSchema = z.object({
  id: z.string().min(1, { message: reqError("Machine Id") }),
  hostname: z.string(),
  name: z.string().default(""), // Read-only preview for UI purposes only. Backend generates final name.
  flowVersionIds: z
    .array(
      z.union([
        z.string().uuid({ message: "Each flow version ID must be a valid GUID." }),
        z.object({
          value: z.string().trim().uuid({ message: "Each flow version ID must be a valid GUID." }),
        }),
      ]),
    )
    .default([]),

  isDisabled: z.boolean().default(false),
});
