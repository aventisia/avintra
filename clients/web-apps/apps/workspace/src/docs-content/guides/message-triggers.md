The **Message Triggers** page lets you create and manage triggers that start an agent automatically when a message arrives in a connected channel.

## Purpose

A message trigger watches a message source (e.g. Microsoft Teams) and starts the configured agent when a new message arrives. Use it to automate message-driven workflows.

## The layout

The page has **Personal** and **Shared** tabs. Your own triggers appear under **Personal**; triggers shared with you appear under **Shared**. The **Create** button is only available on the **Personal** tab.

## The table

The page shows a table of message triggers with columns such as:

- **Name** — the trigger's name.
- **Provider** — the message provider.
- **Resource** — the message resource being watched.
- **Reference** — the resource reference.
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

## Creating a message trigger

Click the **Create** button. Fill in:

- **Unique Name** — *Required.* A unique name for the trigger.
- **Resource** — *Optional.* The message resource to watch (e.g. Teams).
- **Resource ID(s)** — *Required.* The ID(s) based on the selected resource. For multiple IDs, use `/` in the same order as in the resource path. Example: `team-id/channel-id`.
- **Expiry Date & Time** — *Required.* When the trigger expires.
- **Resubscribe** — *Optional.* Maintains continuous connectivity.
- **Subscription Period (in minutes)** — *Required.* Duration in minutes (1-4320).
- **Credential Id** — *Required.* The credential used to access the message source.
- **Provider** — *Required.* The message provider.

After creating, the trigger starts the configured agent when a message is received.
