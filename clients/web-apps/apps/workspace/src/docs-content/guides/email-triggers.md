The **Email Triggers** page lets you create and manage triggers that start an agent automatically when an email is received.

## Purpose

An email trigger watches a mailbox and starts the configured agent when a new email arrives. Use it to automate email-driven workflows.

## The layout

The page has **Personal** and **Shared** tabs. Your own triggers appear under **Personal**; triggers shared with you appear under **Shared**. The **Create** button is only available on the **Personal** tab.

## The table

The page shows a table of email triggers with columns such as:

- **Name** — the trigger's name.
- **Mailbox** — the mailbox being watched.
- **Folder** — the folder being monitored.
- **Provider** — the email provider.
- **Agents** — which agents the trigger starts.
- **Timezone** — the timezone the schedule uses.
- **Expiry Date** — when the trigger expires.
- **Created By / Created On** — who created the trigger and when.

## Row actions (the three dots)

Each row has a **⋮** menu with actions such as:

- **View** — see the trigger's details.
- **Edit** — change the trigger's configuration.
- **Share** — manage who can access the trigger.
- **Delete** — remove the trigger.

## Creating an email trigger

Click the **Create** button. Fill in:

- **Unique Name** — _Required._ A unique name for the trigger.
- **Account Id** — _Required._ The email account/mailbox to watch.
- **Folder** — _Optional._ The folder to monitor.
- **Expiry Date & Time** — _Required._ When the trigger expires.
- **Resubscribe** — _Optional._ Maintains continuous connectivity.
- **Subscription Period (in minutes)** — _Required._ Duration in minutes (1-4320).
- **Credential Id** — _Required._ The credential used to access the mailbox.
- **Provider** — _Required._ The email provider.

After creating, the trigger starts the configured agent when an email is received.
