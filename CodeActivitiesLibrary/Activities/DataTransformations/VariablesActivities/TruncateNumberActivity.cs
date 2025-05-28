using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Truncate Number")]
    [Description("Performs various operations on a number, such as getting the integer part, decimal part, or rounding.")]
    public class TruncateNumberActivity : CodeActivity
    {
        #region Arguments

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Number")]
        [Description("The number to operate on. This can be a number, or a variable containing a number")]
        public InArgument<double> Number { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Operation")]
        [DefaultValue(NumberOperationEnum.GetIntegerPart)]
        [Description("Specifies the operation to perform on the number.")]
        public InArgument<NumberOperationEnum> Operation { get; set; }

        [Category("Input")]
        [DisplayName("Decimal Places")]
        [DefaultValue(2)]
        [Description("The number of decimal places to round to. Required only if the operation is 'RoundNumber'.")]
        [RenderIfCondition(nameof(Operation), NumberOperationEnum.GetRoundNumber)]
        public InArgument<int> DecimalPlaces { get; set; }

        [Category("Output")]
        [DisplayName("Truncated Number")]
        [Description("Returns the result of the operation.")]
        public OutArgument<double> TruncatedNumber { get; set; }

        public OutArgument<string> StatusMessage { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            var number = Number.Get(context);
            var operation = Operation.Get(context);
            var decimalPlaces = DecimalPlaces.Get(context);
            double result = 0;
            var status = "";

            try
            {
                switch (operation)
                {
                    case NumberOperationEnum.GetIntegerPart:
                        result = Math.Truncate(number);
                        status = "Integer part extracted successfully.";
                        break;

                    case NumberOperationEnum.GetDecimalPart:
                        result = number - Math.Truncate(number);
                        status = "Decimal part extracted successfully.";
                        break;

                    case NumberOperationEnum.GetRoundNumber:
                        result = Math.Round(number, decimalPlaces);
                        status = $"Number rounded to {decimalPlaces} decimal places successfully.";
                        break;

                    default:
                        throw new ArgumentException("Invalid operation specified.");
                }

                TruncatedNumber.Set(context, result);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error performing operation: {ex.Message}";
                StatusMessage.Set(context, status);
            }
        }
    }

    public enum NumberOperationEnum
    {
        [Display(Name = "Get Integer Part", Description = "Extracts the integer part of the number.")]
        GetIntegerPart = 0,

        [Display(Name = "Get Decimal Part", Description = "Extracts the decimal part of the number.")]
        GetDecimalPart = 1,

        [Display(Name = "Round Number", Description = "Rounds the number to a specified number of decimal places.")]
        GetRoundNumber = 2
    }
}