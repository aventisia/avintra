using System;

namespace CodeActivitiesLibrary.Extensions
{
    [AttributeUsage(AttributeTargets.Class, Inherited = false)]
    public class ActivityMetaDataAttribute : Attribute
    {
        public string NodeType { get; }
        public string NodeIcon { get; }
        public string NodeImg { get; }
        public string DocsLink { get; }

        public ActivityMetaDataAttribute(string nodeType,
            string nodeIcon = null,
            string nodeImg = "/function.png",
            string docsLink = "https://docs.aventisia.com")
        {
            NodeType = nodeType;
            NodeIcon = nodeIcon;
            NodeImg = nodeImg;
            DocsLink = docsLink;
        }
    }
}
