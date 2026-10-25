# FoldersTable

## Problem

The Agents page under Build shows every agent a person can see in one flat list. Teams with many agents have no way to group related ones, so finding an agent means scrolling or remembering its exact name, and the list gets harder to use as it grows. People need folders: named groups they can create, open, and move agents into and out of.

## How it will work

Changed or new steps are marked **[NEW]** or **[CHANGED]**.

1. The user opens Build, then **Agents**. The **All** and **Archived** tabs stay.
2. **[CHANGED]** On **All**, folders are listed first, then the agents that are not in any folder. This works in both the grid and table views. Each folder shows its name, its description, and how many agents in it the user can see.
3. **[NEW]** Clicking a folder opens a folder page titled with the folder's name, with a breadcrumb back to **Agents**. It lists the agents in that folder with the same search, grid/table view and paging as the main page.
4. Clicking an agent, wherever it appears, still opens it in the Agent Builder.
5. **[CHANGED]** The Create Agent button becomes a split button. The main part still creates an agent. Its menu offers **Create Agent** and **Create Folder**. On a folder page, **Create Folder** is not offered (folders do not nest), and an agent created there lands in that folder.
6. **[NEW]** **Create Folder** opens a dialog asking for a name (required, up to 50 characters, unique), a color (a random one is preselected; the user can pick another from the palette) and an optional description (up to 250 characters).
7. **[NEW]** The user can drag an agent onto a folder to move it in. On a folder page, dragging an agent onto the **Agents** breadcrumb takes it out of the folder.
8. **[NEW]** The agent menu gains **Move to folder…**, which opens a folder picker, for any agent the user can edit, whether it is at the top level or already in a folder. Agents inside a folder also get **Remove from folder**. Both, and dragging, are available only to users who can edit that agent.
9. **[NEW]** Each folder has a menu with **Edit** (name, color and description) and **Delete**. Deleting a folder asks for confirmation, stating how many agents it holds, and then returns its agents to the top level. No agent is deleted.
10. **[CHANGED]** With search text entered on the main page, the results show matching folders and matching agents from anywhere, including agents inside folders; each agent found inside a folder shows its folder's name. On a folder page, search covers only that folder.
11. Moving an agent changes where it appears for everyone who can see it.
12. The **Archived** tab is unchanged. An archived agent keeps its folder, so it shows up in that folder again after it is restored.

## Rules and exceptions

- **Who sees what.** Agents keep their current visibility rules: own agents, agents shared with the user, and agents available to everyone in the tenant. Folders never grant access. A folder shows only the agents the user could already see, so two people can see different counts for the same folder.
- **One folder per agent, one level deep.** An agent sits in at most one folder or in none. Folders contain only agents, not other folders.
- **Folders belong to a space.** Agents belong to the space they were created in, and folders work the same way: a folder exists only in the space where it was created, and the page shows only the current space's folders. Folder names must be unique within a space. (The issue said "per tenant"; the user settled on per space.)
- **Folders are shared, not personal.** Everyone in the space sees the same folders, and an agent's folder is the same for everyone who can see it. Anyone who can create agents can create, edit, or delete a folder.
- **Editing access is required to move.** Only users who own an agent or have Edit access to it can move it into, out of, or between folders. This follows the existing rule for editing an agent.
- **Deleting a folder that holds agents.** After a confirmation that states how many agents will be affected, all its agents go back to the top level, including agents the person deleting cannot see. Nothing else is deleted.
- **Drag and drop.** The product has no drag-and-drop today. The build may add a well-established third-party drag-and-drop library. "Move to folder…" remains the keyboard-accessible way to move agents.
- **No environment lock.** The Agents page has no Production environment restriction today, and this work adds none: creating, editing and deleting folders and moving agents behave the same in every environment.
- **Other ways agents are created.** Agents created by cloning from version history or from a template start at the top level, not in a folder.
- **Name rules.** Folder names follow the same rules as Space names: required, at most 50 characters, unique within the space regardless of upper or lower case. Descriptions are at most 250 characters.
- **Help guide.** The in-app help for the Agents page is updated to cover folders and the split button, and its outdated mention of Personal/Shared tabs is corrected.
- **Known gap the build must close.** Today, saving an agent with an empty value leaves the old value in place. Because of this, "Remove from folder" would silently do nothing if it were built on the existing agent save. The build must make removing an agent from its folder actually take effect.

## Out of scope

- Subfolders or folders inside folders.
- Folders on any page other than Build, then Agents. Other things, such as Queues or Tools, may get folders later; this work prepares only agents.
- Showing or changing an agent's folder from inside the Agent Builder.
- Moving several agents at once, whether by selecting several and choosing a bulk "Move to folder" or by dragging several together. A possible follow-up.
- Personal, per-user folders. Folders are shared within the space.
- Folder-level sharing or permissions.
- Changes to the Archived tab beyond keeping each agent's folder.