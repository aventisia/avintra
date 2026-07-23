import { z } from "zod";

import { isEmailAvailable } from "@/react-toolkit/apis/accounts-auth-apis";

export const EmailUpdateZodSchema = z.object({
  email: z
    .string()
    .min(1, { message: "This field has to be filled." })
    .email("This is not a valid email.")
    .refine(
      async (e) => (await isEmailAvailable({ userInput: e })).data.result,
      "This email is already in use!",
    ),
});
