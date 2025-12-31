namespace AccountsAPIs.Enums;

public enum SubscriptionStatusTypesEnum
{
    /// <summary>
    /// The subscription has been initiated but has not yet undergone authentication or activation.
    /// </summary>
    [Description("Subscription initiated, awaiting authentication or activation.")]
    Initiated,

    /// <summary>
    /// The subscription has been authenticated and is ready for use.
    /// </summary>
    [Description("Subscription has been authenticated and is ready for use.")]
    Authenticated,

    /// <summary>
    /// The subscription is currently active and in use.
    /// </summary>
    [Description("Subscription is currently active and in use.")]
    Active,

    /// <summary>
    /// The subscription is in a pending state, awaiting some action or confirmation.
    /// </summary>
    [Description("Subscription is pending and awaits action or confirmation.")]
    Pending,

    /// <summary>
    /// The subscription has been halted, likely due to an issue or manual intervention.
    /// </summary>
    [Description("Subscription has been halted, possibly due to an issue or manual intervention.")]
    Halted,

    /// <summary>
    /// The subscription has been paused, temporarily suspending the service.
    /// </summary>
    [Description("Subscription has been paused, temporarily suspending the service.")]
    Paused,

    /// <summary>
    /// The subscription has been cancelled, either by the user or due to a payment failure.
    /// </summary>
    [Description("Subscription has been cancelled, either by the user or due to a payment failure.")]
    Cancelled,

    /// <summary>
    /// The subscription has been completed, typically indicating the successful fulfillment of its term.
    /// </summary>
    [Description("Subscription has been completed, indicating the successful fulfillment of its term.")]
    Completed,

    /// <summary>
    /// The subscription has expired, meaning it is no longer valid.
    /// </summary>
    [Description("Subscription has expired and is no longer valid.")]
    Expired,

    // NOTE: This status is currently unused and may be reserved for future use.
    /// <summary>
    /// The subscription has been created but has not yet been authenticated or activated.
    /// </summary>
    [Description("Subscription created, pending authentication or activation.")]
    Created,
}
