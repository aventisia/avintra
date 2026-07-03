using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Generate Random Number")]
    [Description("Generates a random number or list of numbers within a specified range.")]
    [ActivityMetaData(nodeImg: "/assets/Variables.svg")]
    public class GenerateRandomNumberActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Minimum Value")]
        [Description("The lower boundary for the random number(s) to generate.")]
        public InArgument<int> MinimumValue { get; set; }

        [RequiredArgument]
        [DisplayName("Maximum Value")]
        [Description("The upper boundary for the random number(s) to generate.")]
        public InArgument<int> MaximumValue { get; set; }


        [DisplayName("Generate Multiple Numbers")]
        [Description("Specify whether to generate a single number or multiple numbers.")]
        [DefaultValue(false)]
        public InArgument<bool> GenerateMultipleNumbers { get; set; }


        [DisplayName("How Many Numbers")]
        [Description("Specify how many random numbers to generate.")]
        [RenderIfCondition(nameof(GenerateMultipleNumbers), true)]
        public InArgument<int> HowManyNumbers { get; set; }


        [DisplayName("Allow Duplicates")]
        [Description("Specify whether to permit duplicate values in the generated list.")]
        [DefaultValue(false)]
        [RenderIfCondition(nameof(GenerateMultipleNumbers), true)]
        public InArgument<bool> AllowDuplicates { get; set; }


        [DisplayName("Random Number Output")]
        [Description("The newly generated random number (for single mode).")]
        [RenderIfCondition(nameof(GenerateMultipleNumbers), false)]
        public OutArgument<int> RandomNumber { get; set; }


        [DisplayName("Random Numbers List Output")]
        [Description("The newly generated list of random numbers (for multi-mode).")]
        [RenderIfCondition(nameof(GenerateMultipleNumbers), true)]
        public OutArgument<List<int>> RandomNumbers { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var min = MinimumValue.Get(context);
                var max = MaximumValue.Get(context);
                var generateMultiple = GenerateMultipleNumbers.Get(context);
                var count = HowManyNumbers.Get(context);
                var allowDuplicates = AllowDuplicates.Get(context);

                if (min > max)
                    throw new ArgumentException("Minimum value must be less than or equal to maximum value.");

                // Single Mode
                if (!generateMultiple)
                {
                    var result = new Random().Next(min, max + 1);
                    RandomNumber.Set(context, result);
                    status += $" Generated random number: {result}.";
                }
                else
                {
                    // Multi Mode
                    var results = new HashSet<int>();
                    var rand = new Random();
                    var attempts = 0;

                    while (results.Count < count && attempts++ < 1000)
                    {
                        var num = rand.Next(min, max + 1);
                        if (allowDuplicates || !results.Contains(num)) results.Add(num);
                    }

                    if (allowDuplicates && results.Count < count)
                        // Only possible if duplicates are allowed but we couldn't fill due to constraints
                        for (var i = results.Count; i < count; i++)
                            results.Add(rand.Next(min, max + 1));

                    if (results.Count == 0)
                        throw new InvalidOperationException("No valid random numbers could be generated.");

                    RandomNumbers.Set(context, new List<int>(results));
                    status += $" Successfully generated {results.Count} random number(s): {string.Join(", ", results)}.";
                }

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error generating random number(s): {ex.Message}");
            }
        }
    }
}