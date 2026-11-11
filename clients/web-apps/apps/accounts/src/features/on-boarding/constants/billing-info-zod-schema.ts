import { maxLenError, nameError, numericError, reqError } from "@avplatform/ui/utils";
import { nameRegex, numericRegex } from "@avplatform/ui/utils";
import { z } from "zod";

export const billingInfoSchema = z
  .object({
    organizationType: z.enum(["Organization", "Individual"]),

    organizationName: z
      .string()
      .max(100, { message: maxLenError("Organization name", 100) })
      .optional(),

    firstName: z
      .string()
      .min(1, { message: reqError("First name") })
      .max(50, { message: maxLenError("First name", 50) })
      .regex(nameRegex, {
        message: nameError("First name"),
      }),

    lastName: z
      .string()
      .min(1, { message: reqError("Last name") })
      .max(50, { message: maxLenError("Last name", 50) })
      .regex(nameRegex, {
        message: nameError("Last name"),
      }),

    addressLine1: z
      .string()
      .min(1, { message: reqError("Address Line 1") })
      .max(255, { message: maxLenError("Address Line 1", 255) }),
    addressLine2: z.string().optional(),

    state: z
      .string()
      .min(1, { message: reqError("State") })
      .max(255, { message: maxLenError("State", 255) }),

    city: z
      .string()
      .min(1, { message: reqError("City") })
      .max(255, { message: maxLenError("City", 255) })
      .regex(nameRegex, {
        message: nameError("City"),
      }),

    postalCode: z
      .string()
      .min(1, { message: reqError("Pin Code") })
      .max(10, { message: maxLenError("Pin Code", 10) })
      .regex(numericRegex, {
        message: numericError("Pin Code"),
      }),

    country: z
      .string()
      .min(1, reqError("Country"))
      .regex(nameRegex, {
        message: nameError("Country"),
      }),

    isWillingToFileGst: z.boolean().optional(),

    // Conditional validation for gstNumber
    gstNumber: z
      .union([
        z.literal(""),
        z
          .string()
          .min(15, { message: "GST Number must be 15 characters long" })
          .max(15, { message: "GST Number must be 15 characters long" }),
      ])
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.organizationType === "Organization" && !data.organizationName?.trim()) {
      ctx.addIssue({
        path: ["organizationName"],
        message: reqError("Organization name"),
        code: z.ZodIssueCode.custom,
      });
    }

    if (data.isWillingToFileGst) {
      if (!data.gstNumber || data.gstNumber.trim() === "") {
        ctx.addIssue({
          path: ["gstNumber"],
          message: "GST Number is required",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });
