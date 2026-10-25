The **Agents** page is where you build, edit, and manage your AI agents. An agent is an automation built by chaining together nodes — each node performs one step such as processing text, reading from a queue, calling an external tool, or running a skill.

## Purpose

This page is the starting point for creating automation. From here you can create new agents, organize them in folders, open existing ones to edit their workflow, share them with teammates, and remove ones you no longer need.

## The list

The page shows your **folders** at the top, then your agents that are not in a folder, together with agents shared with you. Agents appear either as **cards** (grid) or as a **table**; use the toggle next to the search box to switch between the two. Use **Hide** next to the folders to collapse them.

In the table, the key columns are:

- **Name** — the agent's name. Click it to open the agent editor.
- **Type** — whether the agent is an **Automation Agent** (runs a workflow) or a **Chat Agent** (conversational assistant).
- **Platform** — where the agent can run (e.g. Cloud & Windows).
- **Created By** — who created the agent.

**Select Row**, **Access** and **Created On** are hidden by default; turn them on from **View**. Access keeps its filter.

Archived agents are hidden by default. Turn on the **Archived** toggle (it shows how many there are) to see only them; they are marked as archived. Under each agent's name you see its version, a Published badge (published agents only), when it was last updated, and its queues. Use the search box to filter folders and agents by name. While you search, agents inside folders are included and show the name of their folder; click it to open that folder.

## Folders

Folders group related agents. They are shared with everyone in the current space, and one folder level is available (a folder cannot hold other folders).

- **Create a folder** — click **New folder** at the end of the folders, or open the menu next to **Create** and choose **Create Folder**. Give it a name (required, up to 50 characters, unique in the space) and an optional description (up to 250 characters). A color is picked at random; choose another swatch to change it.
- **Open a folder** — click it. The folder page lists its agents with the same search, grid/table view, and paging. Use the **Agents** link at the top to go back, or click the folder name to jump to another folder.
- **Move an agent into a folder** — drag the agent onto a folder, or open its **⋮** menu, choose **Move to folder** and pick a folder. In that dialog you can also type a new name to create a folder and move the agent into it. Dropping an agent on **New folder** creates a folder with that agent inside.
- **Move an agent out of a folder** — open its **⋮** menu and choose **Remove from folder** (or **Move to folder** and pick **Agents**), or drag it onto the **Agents** link at the top of the folder page.
- **Edit or delete a folder** — use the folder's **⋯** menu, or the **Edit** and delete buttons on the folder page. Editing changes the name, color and description. Deleting a folder asks you to confirm and shows how many agents it holds. Its agents go back to the top level; no agent is deleted.

You can only move an agent if you own it or have Edit access to it. A folder shows only the agents you can already see, so two people may see different counts for the same folder. Archived agents keep their folder and return to it when restored.

## Row actions (the three dots)

Each agent has a **⋮** (three-dot) menu with actions such as:

- **View** — open the agent's details.
- **Edit** — edit the agent's name and description.
- **Move to folder** — put the agent in a folder.
- **Remove from folder** — return the agent to the top level.
- **Share** — share the agent with other users.
- **Delete** — permanently remove the agent.

## Creating an agent

Click the **Create** button (or press **Ctrl+Alt+N**) to open the create form. On a folder page, the new agent is created in that folder. Fill in:

- **Name** — a unique, descriptive name for the agent.
- **Type** — choose **Automation Agent** or **Chat Agent**.
- **Description** — optional, but recommended so others understand the agent's purpose.

After creating the agent, open it to build out its workflow with nodes.
