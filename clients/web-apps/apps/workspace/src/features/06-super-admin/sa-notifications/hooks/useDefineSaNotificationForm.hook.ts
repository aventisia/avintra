import { zodResolver } from "@hookform/resolvers/zod";
import {
  AudienceScopeEnum,
  DeliveryChannelEnum,
  NotificationRecurrenceEnum,
  NotificationTypesEnum,
} from "@avplatform/ui/enums";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AppUserBaseDto } from "../../../notifications/dtos/app-user-base.dto";
import { SaNotificationDto } from "../dtos/sa-notification.dto";
import { SaTenantOptionDto } from "../dtos/sa-tenant-option.dto";

const saNotificationZodSchema = z
  .object({
    title: z
      .string()
      .max(200, "Title cannot exceed 200 characters.")
      .regex(/^[a-zA-Z\s]*$/, "Title can only contain alphabetic characters.")
      .optional(),
    message: z.string().min(1, "Message is required.").max(500, "Message cannot exceed 500 characters."),
    actionUrl: z.string().max(1000, "Action URL cannot exceed 1000 characters.").optional(),
    type: z.nativeEnum(NotificationTypesEnum, { message: "Invalid notification type." }),
    deliveryChannel: z.nativeEnum(DeliveryChannelEnum, { message: "Invalid delivery channel." }),
    audienceScope: z.nativeEnum(AudienceScopeEnum, { message: "Invalid audience scope." }),
    recipients: z.array(z.custom<AppUserBaseDto>()).optional(),
    tenants: z.array(z.custom<SaTenantOptionDto>()).optional(),
    roleIds: z.array(z.string()).optional(),
    scheduledFor: z.date().optional(),
    recurrenceFrequency: z.nativeEnum(NotificationRecurrenceEnum).optional(),
    recurrenceInterval: z.coerce.number().int().min(1).optional(),
    recurrenceWeekdays: z.array(z.string()).optional(),
    recurrenceMonthDays: z.array(z.string()).optional(),
    recurrenceEndOn: z.date().optional(),
  })
  .superRefine((data, ctx) => {
    // SelectedUsers requires at least one recipient
    if (
      data.audienceScope === AudienceScopeEnum.SelectedUsers &&
      (!data.recipients || data.recipients.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["recipients"],
        message: "Select at least one recipient.",
      });
    }

    // SelectedRoles requires at least one role
    if (
      data.audienceScope === AudienceScopeEnum.SelectedRoles &&
      (!data.roleIds || data.roleIds.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["roleIds"],
        message: "Select at least one role.",
      });
    }

    // SelectedTenants requires at least one tenant
    if (
      data.audienceScope === AudienceScopeEnum.SelectedTenants &&
      (!data.tenants || data.tenants.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tenants"],
        message: "Select at least one tenant.",
      });
    }

    // A recurring notification requires a scheduled time and an end date
    if (
      data.recurrenceFrequency &&
      data.recurrenceFrequency !== NotificationRecurrenceEnum.None
    ) {
      if (!data.scheduledFor) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["scheduledFor"],
          message: "A scheduled time is required for recurring notifications.",
        });
      }
      if (!data.recurrenceEndOn) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["recurrenceEndOn"],
          message: "An end date is required for recurring notifications.",
        });
      }
    }

    // Schedule Send cannot be in the past
    if (data.scheduledFor && data.scheduledFor.getTime() <= Date.now()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scheduledFor"],
        message: "Scheduled send time must be in the future.",
      });
    }

    // Schedule End must be after Schedule Send (or null)
    if (data.recurrenceEndOn) {
      if (!data.scheduledFor) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["scheduledFor"],
          message: "A scheduled send time is required when a schedule end time is provided.",
        });
      } else if (data.recurrenceEndOn.getTime() <= data.scheduledFor.getTime()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["recurrenceEndOn"],
          message: "Schedule end time must be after the scheduled send time.",
        });
      }
    }
  });

type SaNotificationFormValues = z.infer<typeof saNotificationZodSchema>;

const defaultValues: SaNotificationFormValues = {
  title: "",
  message: "",
  actionUrl: "",
  type: NotificationTypesEnum.Information,
  deliveryChannel: DeliveryChannelEnum.Platform,
  audienceScope: AudienceScopeEnum.AllUsers,
  recipients: [],
  tenants: [],
  roleIds: [],
  scheduledFor: undefined,
  recurrenceFrequency: NotificationRecurrenceEnum.None,
  recurrenceInterval: 1,
  recurrenceWeekdays: [],
  recurrenceMonthDays: [],
  recurrenceEndOn: undefined,
};

/**
 * Defines the react-hook-form instance for the Super Admin notification compose form.
 * When editing, pass the loaded notification so the audience selection (recipients /
 * tenants) is initialized directly instead of relying on a post-mount reset.
 */
const useDefineSaNotificationForm = (
  notification?: SaNotificationDto | null,
  recipients?: AppUserBaseDto[],
  tenants?: SaTenantOptionDto[],
) => {
  const form = useForm<SaNotificationFormValues>({
    defaultValues: notification
      ? {
          title: notification.title ?? "",
          message: notification.message,
          actionUrl: notification.actionUrl ?? "",
          type: notification.type,
          deliveryChannel: notification.deliveryChannel,
          audienceScope: notification.audienceScope ?? AudienceScopeEnum.AllUsers,
          recipients: recipients ?? [],
          tenants: tenants ?? [],
          roleIds: [],
          scheduledFor: notification.scheduledFor ? new Date(notification.scheduledFor) : undefined,
          recurrenceFrequency: notification.recurrenceFrequency ?? NotificationRecurrenceEnum.None,
          recurrenceInterval: notification.recurrenceInterval ?? 1,
          recurrenceWeekdays: (notification.recurrenceWeekdays ?? []).map(String),
          recurrenceMonthDays: (notification.recurrenceMonthDays ?? []).map(String),
          recurrenceEndOn: notification.recurrenceEndOn ? new Date(notification.recurrenceEndOn) : undefined,
        }
      : defaultValues,
    resolver: zodResolver(saNotificationZodSchema),
  });

  const { isDirty, isValid } = form.formState;

  return { form, isDirty, isValid };
};

export { saNotificationZodSchema, useDefineSaNotificationForm, type SaNotificationFormValues };
