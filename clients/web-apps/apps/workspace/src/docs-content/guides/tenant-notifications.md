The **Notifications** page lets tenant administrators manage how notifications are delivered across the workspace. It has two modes, controlled by a switch at the top: **Manual Notifications** and **Auto Notifications**.

## Purpose

Use this page to:

- **Broadcast a notification manually** to recipients in the tenant (create, view, edit, and delete entries in the notifications table).
- **Configure automatic notifications** — enable or disable the system notifications your tenant automatically sends (e.g. low-credit, subscription renewal, agent publish, and risk assessment approval).

## The switch

At the top of the page, next to the heading, a two-segment switch lets you flip between:

- **Manual Notifications** (the default) — the notifications broadcast table.
- **Auto Notifications** — the delivery and notification-type settings panel.

## Manual Notifications

This view shows a table of the notifications that have been sent or scheduled. Each entry includes:

- **Title** — the notification subject line.
- **Message** — the notification body text.
- **Type** — the notification category.
- **Status** — the current state of the notification.
- **Date** — when it was created/sent.

You can **search** the list, adjust the **columns** shown with the view options, and **select rows** to perform **bulk actions** (for example, deleting several notifications at once). A **Compose** (plus) button opens the form to create a new notification. Each row's actions menu provides **view**, **edit**, and **delete**.

## Auto Notifications

This view is a settings panel that lets you configure automatic notifications for the tenant.

### Delivery Channel

Choose how automatic notifications are delivered to recipients:

- **Platform** — delivered inside the app.
- **Email** — delivered by email.
- **Both** — delivered via both the platform and email (default).

### Notification Types

Enable or disable each automatic notification type for this tenant. All types are turned on by default:

- **Low Credit** — notifies tenant admins when the credit balance falls below a configured **Low Credit Threshold** (a number greater than 0, default 1000).
- **Subscription** — notifies tenant admins of an upcoming subscription renewal, using the **Subscription Reminder Days** setting (the number of days before renewal to start sending reminders, default 7).
- **Publish Agent** — notifies orchestrator managers when an agent is published and ready for use.
- **Agent Risk Assessment Approval** — notifies the designated approver when an agent risk assessment is submitted for approval.

Enabling **Low Credit** or **Subscription** reveals the associated numeric input so you can set the threshold or reminder window. Changes are saved with the **Save** button.
