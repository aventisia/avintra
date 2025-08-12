using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.UiInterfaceAutomations.XmlActivities.Enums;
using System;
using System.Activities;
using System.ComponentModel;
using System.Xml;

namespace CodeActivitiesLibrary.UiInterfaceAutomations.XmlActivities
{
    [DisplayName("Get XML Element Value")]
    [Description("Gets the value of an XML element based on the provided XPath query.")]
    [ActivityMetaData(nodeImg: "/assets/XML.svg")]
    public class GetXmlElementValueActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("XML Content")]
        [Description("The XML content as a string.")]
        public InArgument<string> XmlContent { get; set; }

        [RequiredArgument]
        [DisplayName("XPath Expression")]
        [Description("The XPath expression to locate the XML element.")]
        public InArgument<string> XPath { get; set; }

        [DefaultValue(GetValueAsEnum.TextValue)]
        [DisplayName("Get Value As")]
        [Description("Specifies how the XML element value should be returned.")]
        public InArgument<GetValueAsEnum> GetValueAs { get; set; }

        [DisplayName("XML Element Value")]
        [Description("Returns the value of the XML element.")]
        public OutArgument<string> XmlElementValue { get; set; }
        protected override void Execute(CodeActivityContext context)
        {
            var xmlContent = XmlContent.Get(context);
            var xpath = XPath.Get(context);
            var getValueAs = GetValueAs.Get(context);
            string elementValue = null;

            try
            {
                if (string.IsNullOrEmpty(xmlContent))
                    throw new ArgumentException("XML content cannot be null or empty.");

                if (string.IsNullOrEmpty(xpath)) throw new ArgumentException("XPath cannot be null or empty.");

                var xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(xmlContent);

                var node = xmlDoc.SelectSingleNode(xpath);
                if (node == null) throw new ArgumentException($"No element found at XPath: {xpath}");

                // Retrieve the element value
                elementValue = node.InnerText;

                // Convert the value based on the 'GetValueAs' setting
                switch (getValueAs)
                {
                    case GetValueAsEnum.TextValue:
                        // No conversion needed; return as text
                        break;

                    case GetValueAsEnum.NumericValue:
                        if (!double.TryParse(elementValue, out var numericValue))
                            throw new FormatException(
                                $"Cannot convert element value '{elementValue}' to a numeric value.");
                        elementValue = numericValue.ToString();
                        break;

                    case GetValueAsEnum.DateTimeValue:
                        if (!DateTime.TryParse(elementValue, out var dateTimeValue))
                            throw new FormatException(
                                $"Cannot convert element value '{elementValue}' to a datetime value.");
                        elementValue = dateTimeValue.ToString("yyyy-MM-ddTHH:mm:ss");
                        break;

                    case GetValueAsEnum.BooleanValue:
                        if (!bool.TryParse(elementValue, out var booleanValue))
                            throw new FormatException(
                                $"Cannot convert element value '{elementValue}' to a boolean value.");
                        elementValue = booleanValue.ToString();
                        break;

                    default:
                        throw new ArgumentException($"Unsupported 'GetValueAs' option: {getValueAs}");
                }

                XmlElementValue.Set(context, elementValue);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "XML element value retrieved successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving XML element value: {ex.Message}");
            }
        }
    }
}