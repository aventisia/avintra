using System.Xml;

namespace NodeLibrary.XmlNodes;

[DisplayName("Execute XPath Expression"), Description("Executes an XPath expression on the provided XML content and returns the result.")]
[NodeMetadata(icon: "/assets/XML.svg")]
public class ExecuteXPathExpressionNode : BaseNode
{
    [DisplayName("XML Content"), Description("The XML content to query with XPath.")]
    public required InArgument<string> XmlContent { get; set; }

    [DisplayName("XPath Expression"), Description("The XPath expression to execute.")]
    public required InArgument<string> XPathExpression { get; set; }

    [DisplayName("Get First Value Only"), Description("If true, only the first matching node will be returned. If false, all matching nodes will be returned as a list.")]
    public InArgument<bool> GetFirstValueOnly { get; set; } = new InArgument<bool>(false);

    [DisplayName("XPath Result"), Description("Returns the value of the first matching node or null if not found.")]
    public OutArgument<string> XPathResult { get; set; } = new OutArgument<string>();

    [DisplayName("XPath Results"), Description("Returns all matching nodes as a list of strings.")]
    public OutArgument<List<string>> XPathResults { get; set; } = new OutArgument<List<string>>();

    protected override void Execute(INodeContext context)
    {
        var status = "XPath executed successfully.";

        try
        {
            var xml = XmlContent.Get(context);
            var xpath = XPathExpression.Get(context);
            var getFirstValueOnly = GetFirstValueOnly.Get(context);

            if (string.IsNullOrEmpty(xml))
                throw new ArgumentException("XML content cannot be null or empty.");

            if (string.IsNullOrEmpty(xpath))
                throw new ArgumentException("XPath expression cannot be null or empty.");

            var xmlDoc = new XmlDocument();
            xmlDoc.LoadXml(xml);

            var nav = xmlDoc.CreateNavigator();
            var expr = nav!.Compile(xpath);
            var iterator = nav.Select(expr);

            if (getFirstValueOnly)
            {
                var result = iterator.MoveNext() ? iterator.Current!.Value : null;
                if (result == null)
                    status = "No nodes matched the XPath expression.";

                XPathResult.Set(context, result!);
                XPathResults.Set(context, null!);
            }
            else
            {
                var nodeList = new List<string>();
                while (iterator.MoveNext())
                    nodeList.Add(iterator.Current!.Value);

                var results = nodeList.Count == 0 ? [] : nodeList;
                if (results.Count == 0)
                    status = "No nodes matched the XPath expression.";

                XPathResult.Set(context, null!);
                XPathResults.Set(context, results);
            }

            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error executing XPath: {ex.Message}");
        }
    }
}
