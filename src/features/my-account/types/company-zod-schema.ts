import { maxLenError } from "@/react-toolkit/utils/error-message-list";
import { z } from "zod";

export const CompanyZodSchema = z.object({
    userId: z.string(),
    companyType: z.string({ required_error: "Company type is required" }),
    companyName: z.string({ required_error: "company name is required" }).max(200, { message: "" }),
    role: z.string({ required_error: "role is required" }),
    addressLine1: z.string().max(500, { message: maxLenError("Address is required", 500) }),
    addressLine2: z.string(),
    country: z.string({ required_error: "Country is required" }),
    stateOrProvince: z.string({ required_error: "State or Province is required" }),
    city: z.string({ required_error: "City is required" }),
    ZipOrPostalCode: z.string({ required_error: "Zip is required" }),
})