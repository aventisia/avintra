
The **Queues** page lets you create and manage queues. A **queue** holds work items that wait to be processed by an agent or machine. Queues decouple the producers of work from the consumers, letting you balance load and process items reliably.

## Purpose

Use queues to organize incoming work and route it to the right agents. For example, an email trigger can drop incoming emails into a queue, and an agent processes each item in turn.

## The table

The page shows a table of queues with these key columns:

- **Name** — the queue's name.
- **Type** — the queue type (Agent or User).
- **Processing Mode** — how items are picked (Flexible or Fifo).
- **Agents** — which agents process items from this queue.
- **Total** — the number of work items in the queue.
- **Last Modified On** — when the queue was last changed.

Use the **Personal** and **Shared** tabs to switch between queues you own and queues shared with you.

## Row actions (the three dots)

Each row has a **⋮** menu with actions such as:

- **Edit** — change the queue's name, description, or assigned agents.
- **Assign Agents** — choose which agents process items from this queue.
- **Upload Items** — manually add work items to the queue.
- **Share** — share the queue with other users.
- **Delete** — deletes the queue.
- **Remove** — removes the queue from the user list.
