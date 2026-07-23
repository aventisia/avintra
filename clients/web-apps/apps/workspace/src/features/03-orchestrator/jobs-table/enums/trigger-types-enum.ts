export enum TriggerTypesEnum {
  /** No trigger type. Default value. */
  None = "None",

  /** Triggered manually by a user. */
  Manual = "Manual",

  /** Triggered by an API call. */
  Api = "Api",

  /** Triggered by a webhook event. */
  Webhook = "Webhook",

  /** Triggered by a queue event, such as a message being added to a queue. */
  Queue = "Queue",

  /** Triggered by a generic event. */
  Event = "Event",

  /** Triggered at a specific time or on a schedule. */
  Time = "Time",

  /** Triggered by an incoming email. */
  Email = "Email",

  /** Triggered by an incoming message, such as from a messaging service. */
  Message = "Message",
}
