using System;
using System.Activities;
using System.ComponentModel;
using System.Xml;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.XMLActivities
{
    // Activity: Set XML Element Attribute
    [DisplayName("Set XML Element Attribute")]
    [Description("Sets the value of an attribute of an XML element.")]
    public class SetXmlElementAttributeActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]

        [Description("The XML content as a string.")]
        public InArgument<string> XmlContent { get; set; }

        [RequiredArgument]

        [Description("The XPath expression to locate the element.")]
        public InArgument<string> XPath { get; set; }

        [RequiredArgument]

        [Description("The name of the attribute to set.")]
        public InArgument<string> AttributeName { get; set; }

        [RequiredArgument]

        [Description("The value to set for the attribute.")]
        public InArgument<string> AttributeValue { get; set; }


        [Description("Returns the updated XML content.")]
        public OutArgument<string> UpdatedXmlContent { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var xmlContent = XmlContent.Get(context);
            var xpath = XPath.Get(context);
            var attributeName = AttributeName.Get(context);
            var attributeValue = AttributeValue.Get(context);
            string updatedXmlContent = null;
            var status = "";

            try
            {
                if (string.IsNullOrEmpty(xmlContent)) throw new ArgumentException("XML content cannot be null or empty.");

                if (string.IsNullOrEmpty(xpath)) throw new ArgumentException("XPath cannot be null or empty.");

                if (string.IsNullOrEmpty(attributeName))
                    throw new ArgumentException("Attribute name cannot be null or empty.");

                if (string.IsNullOrEmpty(attributeValue))
                    throw new ArgumentException("Attribute value cannot be null or empty.");

                var xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(xmlContent);

                var node = xmlDoc.SelectSingleNode(xpath);
                if (node == null) throw new ArgumentException($"No element found at XPath: {xpath}");

                var attr = node.Attributes?[attributeName];
                if (attr == null)
                {
                    attr = xmlDoc.CreateAttribute(attributeName);
                    node.Attributes?.Append(attr);
                }

                attr.Value = attributeValue;
                updatedXmlContent = xmlDoc.OuterXml;
                StatusMessage.Set(context, "Attribute set successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error setting XML element attribute: {ex.Message}";
            }

            UpdatedXmlContent.Set(context, updatedXmlContent);
            StatusMessage.Set(context, status);
        }
    }
}