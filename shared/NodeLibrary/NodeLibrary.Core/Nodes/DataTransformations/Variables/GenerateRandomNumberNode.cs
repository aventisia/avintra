namespace NodeLibrary.VariablesNodes;

[DisplayName("Generate Random Number"), Description("Generates a random number or list of numbers within a specified range.")]
[NodeMetadata(icon: "/assets/Variables.svg")]
public class GenerateRandomNumberNode : BaseNode
{
    [DisplayName("Minimum Value"), Description("The lower boundary for the random number(s) to generate.")]
    public required InArgument<int> MinimumValue { get; set; }

    [DisplayName("Maximum Value"), Description("The upper boundary for the random number(s) to generate.")]
    public required InArgument<int> MaximumValue { get; set; }

    [DisplayName("Generate Multiple Numbers"), Description("Specify whether to generate a single number or multiple numbers.")]
    public InArgument<bool> GenerateMultipleNumbers { get; set; } = new InArgument<bool>(false);

    [DisplayName("How Many Numbers"), Description("Specify how many random numbers to generate.")]
    [RenderIfCondition(nameof(GenerateMultipleNumbers), true)]
    public InArgument<int> HowManyNumbers { get; set; } = new InArgument<int>(5);

    [DisplayName("Allow Duplicates"), Description("Specify whether to permit duplicate values in the generated list.")]
    [RenderIfCondition(nameof(GenerateMultipleNumbers), true)]
    public InArgument<bool> AllowDuplicates { get; set; } = new InArgument<bool>(false);

    [DisplayName("Random Number Output"), Description("The newly generated random number (for single mode).")]
    [RenderIfCondition(nameof(GenerateMultipleNumbers), false)]
    public OutArgument<int> RandomNumber { get; set; } = new OutArgument<int>();

    [DisplayName("Random Numbers List Output"), Description("The newly generated list of random numbers (for multi-mode).")]
    [RenderIfCondition(nameof(GenerateMultipleNumbers), true)]
    public OutArgument<List<int>> RandomNumbers { get; set; } = new OutArgument<List<int>>();

    protected override void Execute(INodeContext context)
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
                    for (var i = results.Count; i < count; i++)
                        results.Add(rand.Next(min, max + 1));

                if (results.Count == 0)
                    throw new InvalidOperationException("No valid random numbers could be generated.");

                RandomNumbers.Set(context, [.. results]);
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