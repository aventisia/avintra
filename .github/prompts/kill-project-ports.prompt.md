---
description: Kill all running project services on localhost so you can start fresh.
---

Kill every process currently listening on the project's localhost ports so the
user can start fresh. The project's dev ports are:

- 4000 (AccountsAPIs)
- 4001 (WorkspaceAPIs)
- 4003 (llmpipeline / uvicorn)
- 3001 (accounts web app)
- 3002 (workspace web app)
- 3004 (docs)
- 3006 (studio)
- 2999 (desktop app)

Steps:

1. List what is currently bound to those ports:

   ```sh
   ss -tlnp 2>/dev/null | grep -E ':(4000|4001|4003|3001|3002|3004|3006|2999)\b'
   ```

2. Collect the PIDs from the `users:(("...",pid=NNNN,...))` output and kill
   them. Prefer a graceful `kill` first, then `kill -9` for anything that
   survives.

3. Re-run the `ss` check and confirm every port is free. Report the result.

Do not kill processes on ports outside this list, and do not touch unrelated
system services.
