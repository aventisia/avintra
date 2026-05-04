using System.ComponentModel.DataAnnotations;

namespace NodeLibrary.DataTransformations.Variables;

[DisplayName("Sort List"), Description("Sorts a list by one or more properties. Supports ascending or descending order.")]
[NodeMetadata(icon: "/assets/Variables.svg")]
public class SortListNode : BaseNode
{
    [DisplayName("List to Sort"), Description("The variable that holds the list to sort.")]
    public required InArgument<List<object>> ListToSort { get; set; }

    [DisplayName("Sort By Properties"), Description("Enable if sorting based on object properties (e.g., files, folders).")]
    public InArgument<bool> SortByProperties { get; set; } = new InArgument<bool>(false);

    [DisplayName("First Property to Sort By"), Description("The first property name to sort the list by.")]
    [RenderIfCondition(nameof(SortByProperties), true)]
    public InArgument<string> FirstProperty { get; set; } = new InArgument<string>();

    [DisplayName("First Sort Direction"), Description("Specifies whether to sort the first property in ascending or descending order.")]
    [RenderIfCondition(nameof(SortByProperties), true)]
    public InArgument<SortOrderEnum> FirstSort { get; set; } = new InArgument<SortOrderEnum>(SortOrderEnum.Ascending);

    [DisplayName("Second Property to Sort By"), Description("The second property name to sort the list by.")]
    [RenderIfCondition(nameof(SortByProperties), true)]
    public InArgument<string> SecondProperty { get; set; } = new InArgument<string>();

    [DisplayName("Second Sort Direction"), Description("Specifies whether to sort the second property in ascending or descending order.")]
    [RenderIfCondition(nameof(SortByProperties), true)]
    public InArgument<SortOrderEnum> SecondSort { get; set; } = new InArgument<SortOrderEnum>(SortOrderEnum.Ascending);

    [DisplayName("Third Property to Sort By"), Description("The third property name to sort the list by.")]
    [RenderIfCondition(nameof(SortByProperties), true)]
    public InArgument<string> ThirdProperty { get; set; } = new InArgument<string>();

    [DisplayName("Third Sort Direction"), Description("Specifies whether to sort the third property in ascending or descending order.")]
    [RenderIfCondition(nameof(SortByProperties), true)]
    public InArgument<SortOrderEnum> ThirdSort { get; set; } = new InArgument<SortOrderEnum>(SortOrderEnum.Ascending);

    [DisplayName("Sorted List"), Description("The sorted version of the input list.")]
    public OutArgument<List<object>> SortedList { get; set; } = new OutArgument<List<object>>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";

        try
        {
            var inputList = ListToSort.Get(context);
            var sortByProperties = SortByProperties.Get(context);

            if (inputList == null || !inputList.Any())
                throw new ArgumentException("Input list must contain at least one item.");

            var outputList = inputList;

            if (!sortByProperties)
            {
                outputList = inputList.Cast<string>().OrderBy(x => x).Cast<object>().ToList();
                status += " Sorted list alphabetically.";
            }
            else
            {
                var firstProp = FirstProperty.Get(context);
                var firstSort = FirstSort.Get(context);
                if (!string.IsNullOrWhiteSpace(firstProp))
                {
                    outputList = outputList.OrderByPropertyValue(firstProp, firstSort == SortOrderEnum.Ascending)
                        .ToList();
                    status += $" Sorted by '{firstProp}' ({firstSort}).";
                }

                var secondProp = SecondProperty.Get(context);
                var secondSort = SecondSort.Get(context);
                if (!string.IsNullOrWhiteSpace(secondProp))
                {
                    outputList = outputList.OrderByPropertyValue(secondProp, secondSort == SortOrderEnum.Ascending)
                        .ToList();
                    status += $" Then by '{secondProp}' ({secondSort}).";
                }

                var thirdProp = ThirdProperty.Get(context);
                var thirdSort = ThirdSort.Get(context);
                if (!string.IsNullOrWhiteSpace(thirdProp))
                {
                    outputList = outputList.OrderByPropertyValue(thirdProp, thirdSort == SortOrderEnum.Ascending)
                        .ToList();
                    status += $" Then by '{thirdProp}' ({thirdSort}).";
                }
            }

            SortedList.Set(context, outputList);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            SortedList.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error sorting list: {ex.Message}");
        }
    }
}

public enum SortOrderEnum
{
    [Display(Name = "Ascending", Description = "Sort in ascending order")]
    Ascending,

    [Display(Name = "Descending", Description = "Sort in descending order")]
    Descending
}

internal static class EnumerableExtensions
{
    public static IOrderedEnumerable<T> OrderByPropertyValue<T>(
        this IEnumerable<T> source,
        string propertyName,
        bool ascending)
    {
        return ascending
            ? source.OrderBy(item => GetPropertyValue(item, propertyName))
            : source.OrderByDescending(item => GetPropertyValue(item, propertyName));
    }

    private static object GetPropertyValue(object obj, string propertyName)
    {
        if (obj == null)
            return null;

        var type = obj.GetType();
        var property = type.GetProperty(propertyName);

        if (property == null)
            throw new ArgumentException($"Property '{propertyName}' not found on type '{type.Name}'.");

        return property.GetValue(obj);
    }
}
