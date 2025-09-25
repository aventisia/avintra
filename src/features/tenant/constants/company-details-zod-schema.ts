import {
  maxLenError,
  nameError,
  nameRegex,
  numericError,
  numericRegex,
  reqError,
} from "@aventisia/ui/utils";
import { z } from "zod";

export const companyDetailsZodSchema = z
  .object({
    id: z.string(),
    billingEmail: z.string().email(),
    contactPerson: z
      .string()
      .min(1, reqError("Contact Person"))
      .regex(nameRegex, {
        message: nameError("Contact Person"),
      }),
    organizationName: z.string(),

    addressLine1: z
      .string()
      .min(1, { message: reqError("Address Line 1") })
      .max(255, { message: maxLenError("Address Line 1", 255) }),
    addressLine2: z.string().optional(),

    state: z
      .string()
      .min(1, reqError("State"))
      .regex(nameRegex, {
        message: nameError("State"),
      }),

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
