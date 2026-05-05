using System.Xml;

namespace NodeLibrary.XmlNodes;

[DisplayName("Set XML Element Value"), Description("Sets the value of an XML element.")]
[NodeMetadata(icon: "/assets/XML.svg")]
public class SetXmlElementValueNode : BaseNode
{
    [DisplayName("XML Content"), Description("The XML content as a string.")]
    public required InArgument<string> XmlContent { get; set; }

    [DisplayName("XPath Expression"), Description("The XPath expression to locate the element.")]
    public required InArgument<string> XPath { get; set; }

    [DisplayName("Element Value"), Description("The value to set for the element.")]
    public required InArgument<string> ElementValue { get; set; }

    [DisplayName("Updated XML Content"), Description("Returns the updated XML content.")]
    public OutArgument<string> UpdatedXmlContent { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Element value set successfully.";

        try
        {
            var xmlContent = XmlContent.Get(context);
            var xpath = XPath.Get(context);
            var elementValue = ElementValue.Get(context);

            if (string.IsNullOrEmpty(xmlContent))
                throw new ArgumentException("XML content cannot be null or empty.");

            if (string.IsNullOrEmpty(xpath))
                throw new ArgumentException("XPath cannot be null or empty.");

            if (string.IsNullOrEmpty(elementValue))
                throw new ArgumentException("Element value cannot be null or empty.");

            var xmlDoc = new XmlDocument();
            xmlDoc.LoadXml(xmlContent);

            var node = xmlDoc.SelectSingleNode(xpath);
            if (node == null)
                throw new ArgumentException($"No element found at XPath: {xpath}");

            node.InnerText = elementValue;
            UpdatedXmlContent.Set(context, xmlDoc.OuterXml);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error setting XML element value: {ex.Message}");
        }
    }
}
