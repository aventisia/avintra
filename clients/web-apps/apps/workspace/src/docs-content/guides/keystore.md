# Key Store

The **Key Store** page lets you manage API keys and non-secret configuration values that your agents reference. Keys stored here are used by nodes and tools to authenticate against external services.

## Purpose

Keep API keys and configuration values in one place so your agents can reference them by name instead of hard-coding secrets inside a workflow. This makes agents easier to maintain and rotate credentials without editing every flow.

## The table

The page shows a table of keys with columns such as:

- **Name** — the key's name (used to reference it in agents).
- **Value** — the key value (masked for security).
- **Description** — what the key is used for.
- **Created / Modified** — when the key was created and last changed.

## Row actions (the three dots)

Each row has a **⋮** menu with actions such as:

- **Edit** — update the key's value or description.
- **Delete** — remove the key.

## Creating a key

Click the **Create Key** button. Fill in:

- **Name** — a unique name you will reference in agents.
- **Value** — the API key or configuration value.
- **Description** — optional, but recommended.

> **Note:** For highly sensitive secrets, prefer the **Vault** instead of the Key Store.
