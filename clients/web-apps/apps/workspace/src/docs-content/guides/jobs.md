# Jobs

The **Jobs** page lets you track agent executions, their status, and retry or cancel them. A job is a single run of an agent.

## Purpose

Use this page to monitor the health of your automations. See which jobs are running, which completed, and which failed, then take action (retry, cancel, or inspect) as needed.

## The table

The page shows a table of jobs with these key columns:

- **Job** — the job identifier, shown as `agentName_version_jobId`. Click it to open the job details.
- **Status** — the current state of the job (see below).
- **Start Time** — when the job started.
- **Duration** — how long the job ran.

Use the **Current**, **Scheduled**, and **History** tabs to filter jobs by their lifecycle stage.

## Job statuses

- **Created** — the job has been created but has not started running yet.
- **Running** — the job is currently executing.
- **Completed** — the job finished successfully.
- **Failed** — the job failed during execution.
- **Aborted** — the job was immediately terminated.
- **Canceled** — the job was canceled before it started executing.
- **Paused** — the job is paused temporarily and can be resumed later.
- **Resumed** — the job resumed after a pause or interruption.
- **Retrying** — the job is being retried after a failure.
- **Cleanup** — the job is being finalized/cleaned up.
- **Killed** — the job was forcefully terminated (e.g. exceeded its maximum execution time).

## Row actions (the three dots)

Each row has a **⋮** menu with actions such as:

- **View** — open the job details.
- **Retry** — re-run a failed job.
- **Cancel** — cancel a running or scheduled job.
- **Pause / Resume** — pause or resume a job.

## Tips

- Use the **History** tab to review past executions and spot recurring failures.
- Use the search box to filter by agent name, version, or status.
