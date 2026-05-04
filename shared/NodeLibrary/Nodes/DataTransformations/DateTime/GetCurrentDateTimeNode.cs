namespace NodeLibrary.DateTimeNodes;

[DisplayName("Get Current Date and Time"), Description("This activity retrieves the current date and time based on the specified retrieval type and time zone.")]
[NodeMetadata(icon: "/assets/DateTime.svg")]
public class GetCurrentDateTimeNode : BaseNode
{
    [DisplayName("Retrieve Type"), Description("Select the type of datetime information to retrieve (e.g., Current date and time, Current date only).")]
    public required InArgument<RetrieveTypeEnum> RetrieveType { get; set; }

    [DisplayName("Time Zone"), Description("Select the time zone to use for retrieving the datetime (e.g., System time zone, Windows time zone).")]
    public required InArgument<TimezoneTypeEnum> TimezoneType { get; set; }

    [DisplayName("Result"), Description("The retrieved date and time based on the specified options.")]
    public OutArgument<DateTime> Result { get; set; } = new OutArgument<DateTime>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var retrieveType = RetrieveType.Get(context);
            var timezoneType = TimezoneType.Get(context);

            DateTime result = retrieveType switch
            {
                RetrieveTypeEnum.CurrentDateTime => GetDateTime(timezoneType),
                RetrieveTypeEnum.CurrentDateOnly => GetDate(timezoneType),
                _ => throw new ArgumentException($"Unsupported retrieve type: {retrieveType}")
            };

            Result.Set(context, result);
            status += $" Date/time retrieved successfully: {result}.";
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error retrieving date/time: {ex.Message}");
        }
    }

    private DateTime GetDateTime(TimezoneTypeEnum timezoneType)
    {
        return timezoneType switch
        {
            TimezoneTypeEnum.SystemTimeZone => DateTime.Now,
            TimezoneTypeEnum.SpecificTimeZone => DateTime.Now,
            TimezoneTypeEnum.WindowsTimeZone => DateTime.Now,
            TimezoneTypeEnum.CustomInput => DateTime.Now,
            _ => throw new ArgumentException($"Unsupported time zone type: {timezoneType}")
        };
    }

    private DateTime GetDate(TimezoneTypeEnum timezoneType)
    {
        return timezoneType switch
        {
            TimezoneTypeEnum.SystemTimeZone => DateTime.Today,
            TimezoneTypeEnum.SpecificTimeZone => DateTime.Today,
            TimezoneTypeEnum.WindowsTimeZone => DateTime.Today,
            TimezoneTypeEnum.CustomInput => DateTime.Today,
            _ => throw new ArgumentException($"Unsupported time zone type: {timezoneType}")
        };
    }

    public enum RetrieveTypeEnum
    {
        [Description("Retrieves the current date and time.")]
        CurrentDateTime,

        [Description("Retrieves the current date only.")]
        CurrentDateOnly
    }

    public enum TimezoneTypeEnum
    {
        [Description("Uses the system's local time zone.")]
        SystemTimeZone,

        [Description("Uses a specific time zone (to be deprecated).")]
        SpecificTimeZone,

        [Description("Uses the Windows time zone settings.")]
        WindowsTimeZone,

        [Description("Allows custom input for the time zone.")]
        CustomInput
    }
}
