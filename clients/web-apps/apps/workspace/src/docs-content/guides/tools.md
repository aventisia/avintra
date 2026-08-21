
The **Tools** page lets you create and manage tools that connect agents to external systems and APIs. Configure a tool with its endpoint, authentication, and schema, then call it from a node in your agent.

## Purpose

Tools extend what your agents can do by letting them interact with external services. For example, a tool might call a REST API, query a database, or send a message to another system.

## The cards

Tools are displayed as **cards** in a grid (not a table). Each card shows:

- **Name** — the tool's name. Click the card to open it.
- **Description** — what the tool does.

## Row actions (the three dots)

Each card has a **⋮** menu with actions such as:

- **Edit** — change the tool's configuration.
- **Open** — view the tool details.
- **Delete** — remove the tool.

## Creating a tool

Click the **Add** button. Fill in:

- **Name** — a unique, descriptive name.
- **Description** — what the tool does.
- **Base URL** — the external API the tool calls.
- **OpenAPI Specification** — the JSON/YAML spec describing the API.
- **Authentication Type** — how the tool authenticates.
- **Credential** — the credential to use for authentication, if required.

After creating the tool, call it from a node in your agent.
