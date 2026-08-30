using System.Xml;

namespace NodeLibrary.XmlNodes;

[DisplayName("Set XML Element Attribute"), Description("Sets the value of an attribute of an XML element.")]
[NodeMetadata(icon: "/assets/XML.svg")]
public class SetXmlElementAttributeNode : BaseNode
{
    [DisplayName("XML Content"), Description("The XML content as a string.")]
    public required InArgument<string> XmlContent { get; set; }

    [DisplayName("XPath Expression"), Description("The XPath expression to locate the element.")]
    public required InArgument<string> XPath { get; set; }

    [DisplayName("Attribute Name"), Description("The name of the attribute to set.")]
    public required InArgument<string> AttributeName { get; set; }

    [DisplayName("Attribute Value"), Description("The value to set for the attribute.")]
    public required InArgument<string> AttributeValue { get; set; }

    [DisplayName("Updated XML Content"), Description("Returns the updated XML content.")]
    public OutArgument<string> UpdatedXmlContent { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Attribute set successfully.";

        try
        {
            var xmlContent = XmlContent.Get(context);
            var xpath = XPath.Get(context);
            var attributeName = AttributeName.Get(context);
            var attributeValue = AttributeValue.Get(context);

            if (string.IsNullOrEmpty(xmlContent))
                throw new ArgumentException("XML content cannot be null or empty.");

            if (string.IsNullOrEmpty(xpath))
                throw new ArgumentException("XPath cannot be null or empty.");

            if (string.IsNullOrEmpty(attributeName))
                throw new ArgumentException("Attribute name cannot be null or empty.");

            if (string.IsNullOrEmpty(attributeValue))
                throw new ArgumentException("Attribute value cannot be null or empty.");

            var xmlDoc = new XmlDocument();
            xmlDoc.LoadXml(xmlContent);

            var node = xmlDoc.SelectSingleNode(xpath);
            if (node == null)
                throw new ArgumentException($"No element found at XPath: {xpath}");

            var attr = node.Attributes?[attributeName];
            if (attr == null)
            {
                attr = xmlDoc.CreateAttribute(attributeName);
                node.Attributes?.Append(attr);
            }

            attr.Value = attributeValue;
            UpdatedXmlContent.Set(context, xmlDoc.OuterXml);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error setting XML element attribute: {ex.Message}");
        }
    }
}
