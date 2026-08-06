import { z } from "zod";

export const alphaNumericRegex = /^[a-zA-Z0-9\s\-_.,!?'"()&@#$%*+:=;<>/\\[\]{}~`]+$/;

// Title allows only letters and spaces (no numbers or symbols).
export const titleRegex = /^[a-zA-Z\s]+$/;

export const createTicketZodSchema = z
  .object({
    requestType: z.enum(["ServiceRequest", "ChangeRequest"]),
    title: z.string().min(1).max(255).regex(titleRegex, "Title must not contain numbers or symbols"),
    description: z.string().min(20).max(500),
    requiredBy: z.string().optional(),
    agentRefId: z.string().optional(),
    changeSummary: z.string().max(500).optional(),
    changeReason: z.string().max(500).optional(),
    expectedBehavior: z.string().max(500).optional(),
    requestedTimeline: z.string().optional(),
    isDisabled: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.requestType === "ChangeRequest") {
        return !!data.agentRefId;
      }
      return true;
    },
    { message: "Agent is required for Change Requests", path: ["agentRefId"] }
  );

export const ticketCommentZodSchema = z.object({
  message: z.string().min(1).max(500),
});

export const triageZodSchema = z.object({
  status: z.enum(["New", "InProgress", "Closed"]).optional(),
  complexity: z.enum(["Low", "Medium", "High"]).optional(),
  estimatedEffortHours: z.coerce.number().int().min(0).optional(),
  estimatedCompletionDate: z.string().optional(),
  isBillable: z.boolean().optional(),
  requiresCustomerApproval: z.boolean().optional(),
  riskLevel: z.enum(["Low", "Medium", "High"]).optional(),
  dependencies: z.string().max(500).optional(),
  triageRemarks: z.string().max(1000).optional(),
});
