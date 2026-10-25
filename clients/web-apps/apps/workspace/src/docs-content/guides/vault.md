The **Vault** page lets you store and manage encrypted secrets that are protected and audited. Use the Vault for sensitive credentials that should not be stored in plain text.

## Purpose

The Vault provides a secure home for secrets such as passwords, tokens, and other sensitive data. Values are encrypted at rest and access is audited, giving you a safe way to reference secrets from your agents.

## The table

The page shows a table of secrets with columns such as:

- **Name** — the secret's name.
- **Type** — the kind of secret (e.g. password, token).
- **Created By** — who created the secret.
- **Created On** — when the secret was created.

## Row actions (the three dots)

Each row has a **⋮** menu with actions such as:

- **View** — open the secret details.
- **Edit** — update the secret's value or description.
- **Delete** — remove the secret.

## Adding a credential

Click the **Add Credential** button. Fill in:

- **Name** — a unique name you will reference in agents.
- **User Name** — the username associated with the credential.
- **Password** — the password for the credential.
- **Confirm Password** — re-enter the password.
- **Description** — optional, but recommended.

> **Note:** Secrets in the Vault are encrypted and audited. For non-sensitive configuration values, use the **Key Store**.
