# Execution logs (studio)

The run list, the run canvas and the node log panel behind
`/studio/execution-log`. They answer one question: what happened in a past run.

## Run list

Each row shows the run's status, duration and errors in one vocabulary shared with the
workspace Jobs page. The status label, icon and tone, the enum and the error rule live in
`packages/ui` (`@avplatform/ui/enums`, `/constants`, `/utils`); nothing here defines its own
copy, so both pages always agree.

- Errors are Failed, Aborted and Killed. Canceled is neutral: it is not an error, and the
  Errors filter and the per-day error count both follow that rule.
- A run with no end time shows `—`, not a zero duration.

## Canvas

- **Run header** (top right): the run's status, remark and duration. The data comes from the
  job detail endpoint (`GET job-execution-logs/detail/{jobId}`), which carries `status`,
  `remark`, `startTime` and `endTime`; the wording matches the Jobs page.
- **Step marks**: success, failed, killed, aborted and not reached. A step's state is derived,
  never stored: a log for the selected loop iteration (its `isSuccess`) decides success or
  failure; on a Killed, Aborted or Failed run the last log — the list arrives ordered by
  `executedAt` — is the step the run stopped at, but only in the view that contains the run's
  final log; a sub-flow that finished before the run failed elsewhere keeps its own marks. A
  node with no log on such a run shows as not reached. A completed run leaves unlogged nodes
  looking unstarted.
- **End step**: the executor never logs the flow's `flowEndNode` (visual terminator); the
  End step stays unmarked and the last executed node remains the visible end.
- **Loop badge**: shows `current / total` for the selected iteration; the selected loop index
  is in the URL (`li`), the sub-flow caller in `ci`. A loop opens on its last pass; on a
  Killed, Aborted or Failed run it opens on the pass where the run stopped. A loop whose list
  was empty when the run reached it reads `Skipped`, its body stays unlogged and the path after
  it is green.
- **Node log panel**: a step of a sub-flow invoked from a loop is attributed to the loop
  iteration it ran in and to the caller that invoked it. The attribution uses the log's own
  `loopReferenceId` / `loopIterationIndex` / `callerReferenceId` (the parser), not log order,
  and the panel reads the selected iteration path, so two invocations never overwrite each
  other.
