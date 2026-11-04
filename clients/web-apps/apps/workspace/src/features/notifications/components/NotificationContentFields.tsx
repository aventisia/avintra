import { InputField, SelectField, TextareaField } from "@avplatform/ui/form";

import {
  DELIVERY_CHANNEL_OPTIONS,
  NOTIFICATION_TYPE_OPTIONS,
} from "../constants/notification-form-options.constant";

/**
 * Title, message, action URL, type and delivery channel fields shared by the notification compose forms.
 */
export const NotificationContentFields = () => (
  <>
    <InputField
      name="title"
      label="Title"
      placeholder="e.g. Scheduled maintenance"
      description="Optional. Letters and spaces only, up to 200 characters."
      autoFocus
    />

    <TextareaField
      name="message"
      label="Message"
      isRequired
      placeholder="e.g. The platform will be unavailable tonight from 22:00 to 23:00 UTC."
      description="Up to 500 characters."
    />

    <InputField
      name="actionUrl"
      label="Action URL"
      placeholder="e.g. https://example.com/status"
      description="Optional link opened when the notification is clicked."
    />

    <div className="grid grid-cols-2 gap-3">
      <SelectField
        name="type"
        label="Type"
        isRequired
        selectOptions={NOTIFICATION_TYPE_OPTIONS}
        placeholder="Select type"
      />
      <SelectField
        name="deliveryChannel"
        label="Delivery channel"
        isRequired
        selectOptions={DELIVERY_CHANNEL_OPTIONS}
        placeholder="Select channel"
      />
    </div>
  </>
);
