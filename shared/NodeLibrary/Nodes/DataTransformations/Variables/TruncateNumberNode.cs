using System.ComponentModel.DataAnnotations;

namespace NodeLibrary.DataTransformations.Variables;

[DisplayName("Truncate Number"), Description("Gets the integral or fractional digits of a numeric value, or rounds up/down the value to a specified number of decimal places.")]
[NodeMetadata(icon: "/assets/Variables.svg")]
public class TruncateNumberNode : BaseNode
{
    [DisplayName("Number to Truncate"), Description("The numeric value to truncate or round.")]
    public required InArgument<double> NumberToTruncate { get; set; }

    [DisplayName("Operation"), Description("Specifies how to truncate or round the number.")]
    public required InArgument<TruncateOperationEnum> Operation { get; set; }

    [DisplayName("Decimal Places"), Description("The number of decimal places to round to. Only applicable for rounding operations.")]
    [RenderIfCondition(nameof(Operation), TruncateOperationEnum.Round)]
    public InArgument<int> DecimalPlaces { get; set; } = new InArgument<int>(2);

    [DisplayName("Round Operation"), Description("Specifies round up or round down the number.")]
    [RenderIfCondition(nameof(Operation), TruncateOperationEnum.Round)]
    public InArgument<TruncateNumberRoundOperationEnum> RoundOperation { get; set; } = new InArgument<TruncateNumberRoundOperationEnum>(TruncateNumberRoundOperationEnum.RoundUp);

    [DisplayName("Truncated Value"), Description("Returns the truncated or rounded numeric value.")]
    public OutArgument<double> TruncatedValue { get; set; } = new OutArgument<double>();

    protected override void Execute(INodeContext context)
    {
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

    [Display(Name = "Round Down", Description = "Rounds the number down to the specified number of decimal places.")]
    RoundDown
}
