# User Interfaces (Assist)

Lists the custom UI builder projects that have been published and assigned to you — either
individually or because the project is shared with all team members. The interface names appear as a
list on the left side of the page; use the search box to filter them by name.

Clicking a name opens that interface in the pane on the right, showing the published version
read-only inside a sandboxed frame. Until you pick one, the right side shows a "Select an interface"
placeholder. On small screens the list and the open interface take turns filling the screen, with a
back button to return to the list. Drag the handle between the list and the pane to change their size;
the size you pick is remembered on this device, and small screens are unaffected.

A newly saved version appears only after the owner publishes again. If an interface
says it is not available, it has been disabled, unassigned, or unpublished.

## Live data

An interface can be connected to Avintra queues by its builder. When it is, the open interface
reads and writes those queues' work items live — for example listing pending items or adding a new
one. The interface never calls the network itself: it asks this page, which checks the request
against the project's connections (only the named queues and only the allowed operations) and calls
the platform on your behalf. Assignment to the published interface is what grants that access; you do
not need separate access to the queue. Interfaces run under a content security policy that blocks
every other network request.
