using System.Xml;

namespace NodeLibrary.XmlNodes;

[DisplayName("Remove XML Element Attribute"), Description("Removes an attribute from an XML element.")]
[NodeMetadata(icon: "/assets/XML.svg")]
public class RemoveXmlElementAttributeNode : BaseNode
{
    [DisplayName("XML Content"), Description("The XML content as a string.")]
    public required InArgument<string> XmlContent { get; set; }

    [DisplayName("XPath Expression"), Description("The XPath expression to locate the element.")]
    public required InArgument<string> XPath { get; set; }

    [DisplayName("Attribute Name"), Description("The name of the attribute to remove.")]
    public required InArgument<string> AttributeName { get; set; }

    [DisplayName("Updated XML Content"), Description("Returns the updated XML content.")]
    public OutArgument<string> UpdatedXmlContent { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Attribute removed successfully.";

        try
        {
            var xmlContent = XmlContent.Get(context);
            var xpath = XPath.Get(context);
            var attributeName = AttributeName.Get(context);

            if (string.IsNullOrEmpty(xmlContent))
                throw new ArgumentException("XML content cannot be null or empty.");

            if (string.IsNullOrEmpty(xpath))
                throw new ArgumentException("XPath cannot be null or empty.");

            if (string.IsNullOrEmpty(attributeName))
                throw new ArgumentException("Attribute name cannot be null or empty.");

            var xmlDoc = new XmlDocument();
            xmlDoc.LoadXml(xmlContent);

            var node = xmlDoc.SelectSingleNode(xpath);
            if (node == null)
                throw new ArgumentException($"No element found at XPath: {xpath}");

            var attr = node.Attributes?[attributeName];
            if (attr != null)
            {
                node.Attributes?.Remove(attr);
            }
            else
            {
                status = $"Attribute '{attributeName}' not found on the element.";
            }

            UpdatedXmlContent.Set(context, xmlDoc.OuterXml);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error removing XML element attribute: {ex.Message}");
        }
    }
}
