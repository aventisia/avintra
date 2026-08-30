using NodeLibrary.XmlNodes.Enums;
using System.Xml;

namespace NodeLibrary.XmlNodes;

[DisplayName("Get XML Element Attribute"), Description("Gets the value of an attribute of an XML element.")]
[NodeMetadata(icon: "/assets/XML.svg")]
public class GetXmlElementAttributeNode : BaseNode
{
    [DisplayName("XML Content"), Description("The XML content as a string.")]
    public required InArgument<string> XmlContent { get; set; }

    [DisplayName("XPath Expression"), Description("The XPath expression to locate the element.")]
    public required InArgument<string> XPath { get; set; }

    [DisplayName("Attribute Name"), Description("The name of the attribute to retrieve.")]
    public required InArgument<string> AttributeName { get; set; }

    [DisplayName("Get Value As"), Description("Specifies how the attribute value should be returned.")]
    public InArgument<GetValueAsEnum> GetValueAs { get; set; } = new InArgument<GetValueAsEnum>(GetValueAsEnum.TextValue);

    [DisplayName("Attribute Value"), Description("Returns the attribute value.")]
    public OutArgument<string> XmlAttributeValue { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Attribute retrieved successfully.";

        try
        {
            var xmlContent = XmlContent.Get(context);
            var xpath = XPath.Get(context);
            var attributeName = AttributeName.Get(context);
            var getValueAs = GetValueAs.Get(context);

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
            if (attr == null)
                throw new ArgumentException($"Attribute '{attributeName}' not found on the element.");

            var attributeValue = attr.Value;

            switch (getValueAs)
            {
                case GetValueAsEnum.TextValue:
                    break;
                case GetValueAsEnum.NumericValue:
                    if (!double.TryParse(attributeValue, out var numericValue))
                        throw new FormatException($"Cannot convert attribute value '{attributeValue}' to a numeric value.");
                    attributeValue = numericValue.ToString();
                    break;
                case GetValueAsEnum.DateTimeValue:
                    if (!DateTime.TryParse(attributeValue, out var dateTimeValue))
                        throw new FormatException($"Cannot convert attribute value '{attributeValue}' to a datetime value.");
                    attributeValue = dateTimeValue.ToString("yyyy-MM-ddTHH:mm:ss");
                    break;
                case GetValueAsEnum.BooleanValue:
                    if (!bool.TryParse(attributeValue, out var booleanValue))
                        throw new FormatException($"Cannot convert attribute value '{attributeValue}' to a boolean value.");
                    attributeValue = booleanValue.ToString();
                    break;
                default:
                    throw new ArgumentException($"Unsupported 'GetValueAs' option: {getValueAs}");
            }

            XmlAttributeValue.Set(context, attributeValue);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error retrieving XML element attribute: {ex.Message}");
        }
    }
}
