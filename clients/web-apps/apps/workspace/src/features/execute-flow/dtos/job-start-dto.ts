/** Payload to start a job, transitioning it from Created to Running. */
export interface JobStartDto {
  /** The unique identifier of the job to start. */
  id: string;
}
