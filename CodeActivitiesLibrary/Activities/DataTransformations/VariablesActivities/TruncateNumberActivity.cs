using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Truncate Number")]
    [Description(
        "Gets the integral or fractional digits of a numeric value, or rounds up/down the value to a specified number of decimal places.")]
    public class TruncateNumberActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Number to Truncate")]
        [Description("The numeric value to truncate or round.")]
        public InArgument<double> NumberToTruncate { get; set; }

        [RequiredArgument]
        [DisplayName("Operation")]
        [Description("Specifies how to truncate or round the number.")]
        [DefaultValue(TruncateOperationEnum.GetIntegerPart)]
        public InArgument<TruncateOperationEnum> Operation { get; set; }


        [DisplayName("Decimal Places")]
        [Description("The number of decimal places to round to. Only applicable for rounding operations.")]
        [DefaultValue(2)]
        [RenderIfCondition(nameof(Operation), TruncateOperationEnum.Round)]
        public InArgument<int> DecimalPlaces { get; set; }


        [DisplayName("Round Operation")]
        [Description("Specifies round up or round down the number.")]
        [DefaultValue(TruncateNumberRoundOperationEnum.RoundUp)]
        [RenderIfCondition(nameof(Operation), TruncateOperationEnum.Round)]
        public InArgument<TruncateNumberRoundOperationEnum> RoundOperation { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Truncated Value")]
        [Description("Returns the truncated or rounded numeric value.")]
        public OutArgument<double> TruncatedValue { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var number = NumberToTruncate.Get(context);
                var operation = Operation.Get(context);
                var roundOperation = RoundOperation.Get(context);

                if (operation == TruncateOperationEnum.Round)
                {
                    var decimalPlaces = DecimalPlaces.Get(context);

                    if (decimalPlaces < 0)
                        throw new ArgumentException("Decimal Places must be non-negative.");

                    switch (roundOperation)
                    {
                        case TruncateNumberRoundOperationEnum.RoundUp:
                            number = Math.Round(number, decimalPlaces, MidpointRounding.AwayFromZero);
                            break;

                        case TruncateNumberRoundOperationEnum.RoundDown:
                            number = Math.Round(number, decimalPlaces, MidpointRounding.ToEven);
                            break;

                        default:
                            throw new ArgumentException("Unsupported operation.");
                    }
                }
                else
                {
                    switch (operation)
                    {
                        case TruncateOperationEnum.GetIntegerPart:
                            number = Math.Truncate(number);
                            break;

                        case TruncateOperationEnum.GetFractionalPart:
                            number = number - Math.Truncate(number);
                            break;

                        default:
                            throw new ArgumentException("Unsupported operation.");
                    }
                }

                TruncatedValue.Set(context, number);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Number truncated/rounded successfully.");
            }
            catch (Exception ex)
            {
                TruncatedValue.Set(context, 0);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error truncating/rounding number: {ex.Message}");
            }
        }
    }

    public enum TruncateOperationEnum
    {
        [Display(Name = "Get Integer Part", Description = "Retrieves only the integer portion of the number.")]
        GetIntegerPart,

        [Display(Name = "Get Fractional Part", Description = "Retrieves only the fractional portion of the number.")]
        GetFractionalPart,

        [Display(Name = "Round", Description = "Rounds the number specified number of decimal places.")]
        Round
    }

    public enum TruncateNumberRoundOperationEnum
    {
        [Display(Name = "Round Up", Description = "Rounds the number up to the specified number of decimal places.")]
        RoundUp,

        [Display(Name = "Round Down",
            Description = "Rounds the number down to the specified number of decimal places.")]
        RoundDown
    }
}