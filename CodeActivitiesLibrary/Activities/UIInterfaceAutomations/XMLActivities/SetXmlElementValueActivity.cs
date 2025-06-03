using System;
using System.Activities;
using System.ComponentModel;
using System.Xml;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.XMLActivities
{
    // Activity: Set XML Element Value
    [DisplayName("Set XML Element Value")]
    [Description("Sets the value of an XML element.")]
    public class SetXmlElementValueActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]

        [Description("The XML content as a string.")]
        public InArgument<string> XmlContent { get; set; }

        [RequiredArgument]

        [Description("The XPath expression to locate the element.")]
        public InArgument<string> XPath { get; set; }

        [RequiredArgument]

        [Description("The value to set for the element.")]
        public InArgument<string> ElementValue { get; set; }


        [Description("Returns the updated XML content.")]
        public OutArgument<string> UpdatedXmlContent { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var xmlContent = XmlContent.Get(context);
            var xpath = XPath.Get(context);
            var elementValue = ElementValue.Get(context);
            string updatedXmlContent = null;
            var status = "";

            try
            {
                if (string.IsNullOrEmpty(xmlContent)) throw new ArgumentException("XML content cannot be null or empty.");

                if (string.IsNullOrEmpty(xpath)) throw new ArgumentException("XPath cannot be null or empty.");

                if (string.IsNullOrEmpty(elementValue))
                    throw new ArgumentException("Element value cannot be null or empty.");

                var xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(xmlContent);

                var node = xmlDoc.SelectSingleNode(xpath);
                if (node == null) throw new ArgumentException($"No element found at XPath: {xpath}");

                node.InnerText = elementValue;
                updatedXmlContent = xmlDoc.OuterXml;
                StatusMessage.Set(context, "Element value set successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error setting XML element value: {ex.Message}";
            }

            UpdatedXmlContent.Set(context, updatedXmlContent);
            StatusMessage.Set(context, status);
        }
    }
}