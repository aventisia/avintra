using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.DateTimeActivities
{
    [DisplayName("Get Current Date and Time")]
    [Description(
        "This activity retrieves the current date and time based on the specified retrieval type and time zone.")]
    public class GetCurrentDateTimeActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Retrieve Type")]
        [Description(
            "Select the type of datetime information to retrieve (e.g., Current date and time, Current date only).")]

        public InArgument<RetrieveTypeEnum> RetrieveType { get; set; } =
            new InArgument<RetrieveTypeEnum>(RetrieveTypeEnum.CurrentDateTime);

        [RequiredArgument]
        [DisplayName("Time Zone")]
        [Description(
            "Select the time zone to use for retrieving the datetime (e.g., System time zone, Windows time zone).")]

        public InArgument<TimezoneTypeEnum> TimezoneType { get; set; } =
            new InArgument<TimezoneTypeEnum>(TimezoneTypeEnum.SystemTimeZone);


        [DisplayName("Result")]
        [Description("The retrieved date and time based on the specified options.")]

        public OutArgument<DateTime> Result { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input values
                var retrieveType = context.GetValue(RetrieveType);
                var timezoneType = context.GetValue(TimezoneType);

                // Determine the datetime based on the retrieve type
                DateTime result;
                switch (retrieveType)
                {
                    case RetrieveTypeEnum.CurrentDateTime:
                        result = GetDateTime(timezoneType);
                        break;

                    case RetrieveTypeEnum.CurrentDateOnly:
                        result = GetDate(timezoneType);
                        break;

                    default:
                        throw new ArgumentException($"Unsupported retrieve type: {retrieveType}");
                }

                context.SetValue(Result, result);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Date/time retrieved successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving date/time: {ex.Message}");
                context.SetValue(Result, default(DateTime));
            }
        }

        private DateTime GetDateTime(TimezoneTypeEnum timezoneType)
        {
            switch (timezoneType)
            {
                case TimezoneTypeEnum.SystemTimeZone:
                    return DateTime.Now;

                case TimezoneTypeEnum.SpecificTimeZone:
                    // Deprecated behavior - fallback to system time zone
                    return DateTime.Now;

                case TimezoneTypeEnum.WindowsTimeZone:
                    // Use Windows time zone settings (same as system time zone)
                    return DateTime.Now;

                case TimezoneTypeEnum.CustomInput:
                    // For custom input, we would need additional logic to handle user-specified time zones
                    // For simplicity, fallback to system time zone
                    return DateTime.Now;

                default:
                    throw new ArgumentException($"Unsupported time zone type: {timezoneType}");
            }
        }

        private DateTime GetDate(TimezoneTypeEnum timezoneType)
        {
            switch (timezoneType)
            {
                case TimezoneTypeEnum.SystemTimeZone:
                    return DateTime.Today;

                case TimezoneTypeEnum.SpecificTimeZone:
                    // Deprecated behavior - fallback to system time zone
                    return DateTime.Today;

                case TimezoneTypeEnum.WindowsTimeZone:
                    // Use Windows time zone settings (same as system time zone)
                    return DateTime.Today;

                case TimezoneTypeEnum.CustomInput:
                    // For custom input, we would need additional logic to handle user-specified time zones
                    // For simplicity, fallback to system time zone
                    return DateTime.Today;

                default:
                    throw new ArgumentException($"Unsupported time zone type: {timezoneType}");
            }
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
}