using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Xml;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.XMLActivities
{
    // Activity: Remove XML Element
    [DisplayName("Remove XML Element")]
    [Description("Removes one or more XML elements from an XML document.")]
    public class RemoveXmlElementActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [Description("The XML content as a string.")]
        public InArgument<string> XmlContent { get; set; }

        [RequiredArgument]
        [Description("The XPath expression to locate the element(s) to remove.")]
        public InArgument<string> XPath { get; set; }


        [Description("Returns the updated XML content.")]
        public OutArgument<string> UpdatedXmlContent { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var xmlContent = XmlContent.Get(context);
            var xpath = XPath.Get(context);
            string updatedXmlContent = null;
            var status = "";

            try
            {
                if (string.IsNullOrEmpty(xmlContent)) throw new ArgumentException("XML content cannot be null or empty.");

                if (string.IsNullOrEmpty(xpath)) throw new ArgumentException("XPath cannot be null or empty.");

                var xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(xmlContent);

                var nodesToRemove = xmlDoc.SelectNodes(xpath);
                if (nodesToRemove == null || nodesToRemove.Count == 0)
                    throw new ArgumentException($"No elements found at XPath: {xpath}");

                foreach (XmlNode node in nodesToRemove)
                {
                    var parentNode = node.ParentNode;
                    if (parentNode != null) parentNode.RemoveChild(node);
                }

                updatedXmlContent = xmlDoc.OuterXml;
                StatusMessage.Set(context, "Element(s) removed successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error removing XML element(s): {ex.Message}";
            }

            UpdatedXmlContent.Set(context, updatedXmlContent);
            StatusMessage.Set(context, status);
        }
    }
}