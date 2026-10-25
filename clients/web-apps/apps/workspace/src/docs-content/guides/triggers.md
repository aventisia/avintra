The **Triggers** section lets you create and manage triggers that start an agent automatically when an event occurs. Avintra supports four trigger types, each with its own page:

- **Time** — run on a schedule (cron or interval).
- **Email** — start when an email is received.
- **Message** — start when a message arrives in a connected channel.
- **Webhook** — start when an external system calls a webhook URL.

## Purpose

Triggers are how your agents run without manual intervention. Choose the trigger type that matches the event you want to react to, then configure which agent it starts.

## The table

Each trigger page shows a table of triggers with columns such as:

- **Name** — the trigger's name.
- **Agent** — which agent the trigger starts.
- **Schedule / Condition** — when or under what condition the trigger fires.
- **Status** — whether the trigger is active or paused.

## Row actions (the three dots)

Each row has a **⋮** menu with actions such as:

- **Edit** — change the trigger's configuration.
- **Pause / Resume** — temporarily stop or restart the trigger.
- **Delete** — remove the trigger.

## Creating a trigger

Click the **Create Trigger** button. The fields depend on the trigger type:

- **Time** — choose a schedule (e.g. every day at a specific time, or a cron expression) and the agent to run.
- **Email** — specify the mailbox/condition to watch and the agent to run.
- **Message** — specify the channel and message condition to watch.
- **Webhook** — provide a name and the agent to run; the webhook URL is generated for you.

After creating the trigger, it will start the configured agent whenever the event occurs.
