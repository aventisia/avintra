using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UIInterfaceAutomations.XMLActivities.Enums;
using System;
using System.Activities;
using System.ComponentModel;
using System.Xml;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.XMLActivities
{
    // Activity: Get XML Element Attribute
    [DisplayName("Get XML Element Attribute")]
    [Description("Gets the value of an attribute of an XML element.")]
    public class GetXmlElementAttributeActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("XML Content")]
        [Description("The XML content as a string.")]
        public InArgument<string> XmlContent { get; set; }

        [RequiredArgument]
        [DisplayName("XPath Expression")]
        [Description("The XPath expression to locate the element.")]
        public InArgument<string> XPath { get; set; }

        [RequiredArgument]
        [DisplayName("Attribute Name")]
        [Description("The name of the attribute to retrieve.")]
        public InArgument<string> AttributeName { get; set; }

        [DisplayName("Get Value As")]
        [Description("Specifies how the attribute value should be returned.")]
        [DefaultValue(GetValueAsEnum.TextValue)]
        public InArgument<GetValueAsEnum> GetValueAs { get; set; }

        [DisplayName("Attribute Value")]
        [Description("Returns the attribute value.")]
        public OutArgument<string> XmlAttributeValue { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            var xmlContent = XmlContent.Get(context);
            var xpath = XPath.Get(context);
            var attributeName = AttributeName.Get(context);
            var getValueAs = GetValueAs.Get(context);

            string attributeValue = null;
            var status = "";

            try
            {
                if (string.IsNullOrEmpty(xmlContent))
                    throw new ArgumentException("XML content cannot be null or empty.");

                if (string.IsNullOrEmpty(xpath)) throw new ArgumentException("XPath cannot be null or empty.");

                if (string.IsNullOrEmpty(attributeName))
                    throw new ArgumentException("Attribute name cannot be null or empty.");

                var xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(xmlContent);

                var node = xmlDoc.SelectSingleNode(xpath);
                if (node == null) throw new ArgumentException($"No element found at XPath: {xpath}");

                // Retrieve the attribute value
                var attr = node.Attributes?[attributeName];
                if (attr == null) throw new ArgumentException($"Attribute '{attributeName}' not found on the element.");

                attributeValue = attr.Value;

                // Convert the value based on the 'GetValueAs' setting
                switch (getValueAs)
                {
                    case GetValueAsEnum.TextValue:
                        // No conversion needed; return as text
                        break;

                    case GetValueAsEnum.NumericValue:
                        if (!double.TryParse(attributeValue, out var numericValue))
                            throw new FormatException(
                                $"Cannot convert attribute value '{attributeValue}' to a numeric value.");
                        attributeValue = numericValue.ToString();
                        break;

                    case GetValueAsEnum.DateTimeValue:
                        if (!DateTime.TryParse(attributeValue, out var dateTimeValue))
                            throw new FormatException(
                                $"Cannot convert attribute value '{attributeValue}' to a datetime value.");
                        attributeValue = dateTimeValue.ToString("yyyy-MM-ddTHH:mm:ss");
                        break;

                    case GetValueAsEnum.BooleanValue:
                        if (!bool.TryParse(attributeValue, out var booleanValue))
                            throw new FormatException(
                                $"Cannot convert attribute value '{attributeValue}' to a boolean value.");
                        attributeValue = booleanValue.ToString();
                        break;

                    default:
                        throw new ArgumentException($"Unsupported 'GetValueAs' option: {getValueAs}");
                }

                StatusMessage.Set(context, "Attribute retrieved successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error retrieving XML element attribute: {ex.Message}";
            }

            XmlAttributeValue.Set(context, attributeValue);
            StatusMessage.Set(context, status);
        }
    }
}