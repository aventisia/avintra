The **Webhook Triggers** page lets you create and manage triggers that start an agent automatically when an external system calls a webhook URL.

## Purpose

A webhook trigger exposes a generated URL that external systems call to start the configured agent. Use it to integrate agents with external services via HTTP webhooks.

## The layout

The page has **Personal** and **Shared** tabs. Your own triggers appear under **Personal**; triggers shared with you appear under **Shared**. The **Create** button is only available on the **Personal** tab.

## The table

The page shows a table of webhook triggers with columns such as:

- **Name** — the trigger's name.
- **Agent** — which agent the trigger starts.
- **Created By / Created On** — who created the trigger and when.
- **Last Modified By / Last Modified On** — who last changed the trigger and when.

## Row actions (the three dots)

Each row has a **⋮** menu with actions such as:

- **View** — see the trigger's details.
- **Edit** — change the trigger's configuration.
- **Share** — manage who can access the trigger.
- **Delete** — remove the trigger.

## Creating a webhook trigger

Click the **Create** button. Fill in:

- **Unique Name** — *Required.* A unique name for the trigger.
- **Webhook Url** — *Read-only.* Auto-generated after the trigger is created.
- **Callback Url** — *Optional.* URL the webhook calls back to after processing.
- **Input Arguments Schema** — *Optional.* The expected input arguments schema.

After creating, the webhook URL is generated. External systems call it to start the configured agent.
