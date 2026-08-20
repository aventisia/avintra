
The **Tools** page lets you create and manage tools that connect agents to external systems and APIs. Configure a tool with its endpoint, authentication, and schema, then call it from a node in your agent.

## Purpose

Tools extend what your agents can do by letting them interact with external services. For example, a tool might call a REST API, query a database, or send a message to another system.

## The table

The page shows a table of tools with columns such as:

- **Name** — the tool's name.
- **Type** — the kind of tool (e.g. API, function).
- **Description** — what the tool does.
- **Status** — whether the tool is enabled.

## Row actions (the three dots)

Each row has a **⋮** menu with actions such as:

- **Edit** — change the tool's configuration.
- **Open** — view the tool details.
- **Delete** — remove the tool.

## Creating a tool

Click the **Add** button. Fill in:

- **Name** — a unique, descriptive name.
- **Type** — the kind of tool to create.
- **Endpoint / Configuration** — the connection details for the external system.
- **Authentication** — how the tool authenticates (e.g. API key from the Key Store).
- **Schema** — the input/output schema the tool expects.

After creating the tool, call it from a node in your agent.
