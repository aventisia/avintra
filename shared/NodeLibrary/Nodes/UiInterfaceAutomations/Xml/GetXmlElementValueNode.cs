using NodeLibrary.XmlNodes.Enums;
using System.Xml;

namespace NodeLibrary.XmlNodes;

[DisplayName("Get XML Element Value"), Description("Gets the value of an XML element based on the provided XPath query.")]
[NodeMetadata(icon: "/assets/XML.svg")]
public class GetXmlElementValueNode : BaseNode
{
    [DisplayName("XML Content"), Description("The XML content as a string.")]
    public required InArgument<string> XmlContent { get; set; }

    [DisplayName("XPath Expression"), Description("The XPath expression to locate the XML element.")]
    public required InArgument<string> XPath { get; set; }

    [DisplayName("Get Value As"), Description("Specifies how the XML element value should be returned.")]
    public InArgument<GetValueAsEnum> GetValueAs { get; set; } = new InArgument<GetValueAsEnum>(GetValueAsEnum.TextValue);

    [DisplayName("XML Element Value"), Description("Returns the value of the XML element.")]
    public OutArgument<string> XmlElementValue { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "XML element value retrieved successfully.";

        try
        {
            var xmlContent = XmlContent.Get(context);
            var xpath = XPath.Get(context);
            var getValueAs = GetValueAs.Get(context);

            if (string.IsNullOrEmpty(xmlContent))
                throw new ArgumentException("XML content cannot be null or empty.");

            if (string.IsNullOrEmpty(xpath))
                throw new ArgumentException("XPath cannot be null or empty.");

            var xmlDoc = new XmlDocument();
            xmlDoc.LoadXml(xmlContent);

            var node = xmlDoc.SelectSingleNode(xpath);
            if (node == null)
                throw new ArgumentException($"No element found at XPath: {xpath}");

            var elementValue = node.InnerText;

            switch (getValueAs)
            {
                case GetValueAsEnum.TextValue:
                    break;
                case GetValueAsEnum.NumericValue:
                    if (!double.TryParse(elementValue, out var numericValue))
                        throw new FormatException($"Cannot convert element value '{elementValue}' to a numeric value.");
                    elementValue = numericValue.ToString();
                    break;
                case GetValueAsEnum.DateTimeValue:
                    if (!DateTime.TryParse(elementValue, out var dateTimeValue))
                        throw new FormatException($"Cannot convert element value '{elementValue}' to a datetime value.");
                    elementValue = dateTimeValue.ToString("yyyy-MM-ddTHH:mm:ss");
                    break;
                case GetValueAsEnum.BooleanValue:
                    if (!bool.TryParse(elementValue, out var booleanValue))
                        throw new FormatException($"Cannot convert element value '{elementValue}' to a boolean value.");
                    elementValue = booleanValue.ToString();
                    break;
                default:
                    throw new ArgumentException($"Unsupported 'GetValueAs' option: {getValueAs}");
            }

            XmlElementValue.Set(context, elementValue);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error retrieving XML element value: {ex.Message}");
        }
    }
}
