import { z } from "zod";

import {
  maxLenError,
  nameError,
  numericError,
  reqError,
} from "@/react-toolkit/utils/error-message-list";
import { nameRegex, numericRegex } from "@/react-toolkit/utils/regex-list";

export const billingInfoSchema = z
  .object({
    organizationName: z
      .string()
      .min(1, { message: reqError("Organization name") })
      .max(255, { message: maxLenError("Organization name", 255) }),

    addressLine1: z
      .string()
      .min(1, { message: reqError("Address Line 1") })
      .max(255, { message: maxLenError("Address Line 1", 255) }),
    addressLine2: z.string().optional(),

    state: z.string().optional(),

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
