export enum JobStatusTypesEnum {
  // Indicates that the job has been created but has not started running yet.
  Created = "Created",

  // Indicates that the job is currently in the process of running.
  Running = "Running",

  // Indicates that the job has been successfully completed.
  Completed = "Completed",

  // Immediately terminates the job and processes.
  Abort = "Abort",

  // Indicates that the job failed during execution.
  Failed = "Failed",

  // Indicates that the job was canceled before completion.
  Canceled = "Canceled",

  // Indicates that the job is paused temporarily and can be resumed later.
  Paused = "Paused",

  // Indicates that the job has resumed after a pause or interruption.
  Resumed = "Resumed",

  // Indicates that the job has been marked for cleanup and is being finalized.
  Cleanup = "Cleanup",

  // Indicates that the job is in a state where it is being retried after a failure.
  Retrying = "Retrying",

  // Indicates that the job was forcefully terminated, typically because it exceeded its maximum execution time or was killed by the execution monitor.
  Killed = "Killed",
}
