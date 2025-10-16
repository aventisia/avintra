import {
  maxLenError,
  nameError,
  numericError,
  reqError,
} from "@/react-toolkit/utils/error-message-list";
import { nameRegex, numericRegex } from "@/react-toolkit/utils/regex-list";

import { z } from "zod";

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

    state: z
      .string()
      .regex(nameRegex, {
        message: nameError("State"),
      })
      .optional(),

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
      .string()
      .min(0, { message: reqError("GST Number") })
      .max(15, { message: maxLenError("GST Number", 15) })
      .optional(), // Make it optional by default
  })
  .refine(
    (data) =>
      !data.isWillingToFileGst ||
      (data.gstNumber !== undefined && data.gstNumber !== ""),
    {
      message: "GST Number is required",
      path: ["gstNumber"],
    },
  );
