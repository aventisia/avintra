
The **Key Store** page lets you manage API keys and non-secret configuration values that your agents reference. Keys stored here are used by nodes and tools to authenticate against external services.

## Purpose

Keep API keys and configuration values in one place so your agents can reference them by name instead of hard-coding secrets inside a workflow. This makes agents easier to maintain and rotate credentials without editing every flow.

## The table

The page shows a table of keys with columns such as:

- **Name** — the key's name (used to reference it in agents).
- **Type** — the type of key.
- **Created By** — who created the key.
- **Created On** — when the key was created.

## Row actions (the three dots)

Each row has a **⋮** menu with actions such as:

- **View** — open the key details.
- **Edit** — update the key's value or description.
- **Delete** — remove the key.

## Adding a key

Click the **Add** button. Fill in:

- **Unique Name** — a unique name you will reference in agents. **Cannot be changed** after creation.
- **Key Type** — the type of key being stored.
- **Access Level** — the access level for the key.
- **Value** — the API key or configuration value.
- **Tags** — optional tags to organize the key.
- **Description** — optional, but recommended.

> **Note:** For highly sensitive secrets, prefer the **Vault** instead of the Key Store.
