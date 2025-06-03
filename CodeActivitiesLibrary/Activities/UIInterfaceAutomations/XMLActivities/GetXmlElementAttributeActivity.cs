using System;
using System.Activities;
using System.ComponentModel;
using System.Xml;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.XMLActivities
{
    // Activity: Get XML Element Attribute
    [DisplayName("Get XML Element Attribute")]
    [Description("Gets the value of an attribute of an XML element.")]
    public class GetXmlElementAttributeActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]
        [Description("The XML content as a string.")]
        public InArgument<string> XmlContent { get; set; }

        [RequiredArgument]
        [Description("The XPath expression to locate the element.")]
        public InArgument<string> XPath { get; set; }

        [RequiredArgument]
        [Description("The name of the attribute to retrieve.")]
        public InArgument<string> AttributeName { get; set; }


        [Description("Returns the attribute value.")]
        public OutArgument<string> AttributeValue { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var xmlContent = XmlContent.Get(context);
            var xpath = XPath.Get(context);
            var attributeName = AttributeName.Get(context);
            string attributeValue = null;
            var status = "";

            try
            {
                if (string.IsNullOrEmpty(xmlContent))
                {
                    throw new ArgumentException("XML content cannot be null or empty.");
                }

                if (string.IsNullOrEmpty(xpath))
                {
                    throw new ArgumentException("XPath cannot be null or empty.");
                }

                if (string.IsNullOrEmpty(attributeName))
                {
                    throw new ArgumentException("Attribute name cannot be null or empty.");
                }

                var xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(xmlContent);

                var node = xmlDoc.SelectSingleNode(xpath);
                if (node == null)
                {
                    throw new ArgumentException($"No element found at XPath: {xpath}");
                }

                attributeValue = node.Attributes?[attributeName]?.Value;
                StatusMessage.Set(context, "Attribute retrieved successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error retrieving XML element attribute: {ex.Message}";
            }

            AttributeValue.Set(context, attributeValue);
            StatusMessage.Set(context, status);
        }
    }
}