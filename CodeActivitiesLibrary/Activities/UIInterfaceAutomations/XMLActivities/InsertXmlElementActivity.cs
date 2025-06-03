using System;
using System.Activities;
using System.ComponentModel;
using System.Xml;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.XMLActivities
{
    // Activity: Insert XML Element
    [DisplayName("Insert XML Element")]
    [Description("Inserts a new XML element into an XML document.")]
    public class InsertXmlElementActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]

        [Description("The XML content as a string.")]
        public InArgument<string> XmlContent { get; set; }

        [RequiredArgument]

        [Description("The XPath expression to locate the parent element.")]
        public InArgument<string> ParentXPath { get; set; }

        [RequiredArgument]

        [Description("The name of the new element to insert.")]
        public InArgument<string> NewElementName { get; set; }


        [Description("Returns the updated XML content.")]
        public OutArgument<string> UpdatedXmlContent { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var xmlContent = XmlContent.Get(context);
            var parentXPath = ParentXPath.Get(context);
            var newElementName = NewElementName.Get(context);
            string updatedXmlContent = null;
            var status = "";

            try
            {
                if (string.IsNullOrEmpty(xmlContent))
                {
                    throw new ArgumentException("XML content cannot be null or empty.");
                }

                if (string.IsNullOrEmpty(parentXPath))
                {
                    throw new ArgumentException("Parent XPath cannot be null or empty.");
                }

                if (string.IsNullOrEmpty(newElementName))
                {
                    throw new ArgumentException("New element name cannot be null or empty.");
                }

                var xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(xmlContent);

                var parentNode = xmlDoc.SelectSingleNode(parentXPath);
                if (parentNode == null)
                {
                    throw new ArgumentException($"No parent element found at XPath: {parentXPath}");
                }

                var newElement = xmlDoc.CreateElement(newElementName);
                parentNode.AppendChild(newElement);
                updatedXmlContent = xmlDoc.OuterXml;
                StatusMessage.Set(context, "Element inserted successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error inserting XML element: {ex.Message}";
            }

            UpdatedXmlContent.Set(context, updatedXmlContent);
            StatusMessage.Set(context, status);
        }
    }
}