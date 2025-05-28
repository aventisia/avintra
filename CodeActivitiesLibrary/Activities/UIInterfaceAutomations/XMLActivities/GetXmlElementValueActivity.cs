using System;
using System.Activities;
using System.ComponentModel;
using System.Xml;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.XMLActivities
{
    // Activity: Get XML Element Value
    [DisplayName("Get XML Element Value")]
    [Description("Gets the value of an XML element.")]
    public class GetXmlElementValueActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The XML content as a string.")]
        public InArgument<string> XmlContent { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("The XPath expression to locate the element.")]
        public InArgument<string> XPath { get; set; }

        [Category("Output")]
        [Description("Returns the element value.")]
        public OutArgument<string> ElementValue { get; set; }

        [Category("Output")]
        [Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var xmlContent = XmlContent.Get(context);
            var xpath = XPath.Get(context);
            string elementValue = null;
            var status = "";

            try
            {
                if (string.IsNullOrEmpty(xmlContent)) throw new ArgumentException("XML content cannot be null or empty.");

                if (string.IsNullOrEmpty(xpath)) throw new ArgumentException("XPath cannot be null or empty.");

                var xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(xmlContent);

                var node = xmlDoc.SelectSingleNode(xpath);
                if (node == null) throw new ArgumentException($"No element found at XPath: {xpath}");

                elementValue = node.InnerText;
                StatusMessage.Set(context, "Element value retrieved successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error retrieving XML element value: {ex.Message}";
            }

            ElementValue.Set(context, elementValue);
            StatusMessage.Set(context, status);
        }
    }
}