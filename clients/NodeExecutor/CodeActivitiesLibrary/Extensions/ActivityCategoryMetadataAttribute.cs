using System;
using System.Collections.Generic;
using System.Windows.Documents;

namespace CodeActivitiesLibrary.Extensions
{
    [AttributeUsage(AttributeTargets.Class, Inherited = false)]
    public class ActivityCategoryMetadataAttribute : Attribute
    {
        public string PrimaryCategory { get; }
        public string Label { get; }
        public string Description { get; }
        public string Icon { get; }
        public string Img { get; }
        public string ListType { get; }

        /// <summary>
        /// Possible values (one or more separated by comma): "production" or "commercial" or "enterprise" or "production,enterprise" etc
        /// </summary>
        public string DoNotRenderIf { get; }

        public ActivityCategoryMetadataAttribute(
            string primaryCategory,
            string label,
            string description,
            string icon = null,
            string img = null,
            string listType = null,
            string doNotRenderIf = null)
        {
            PrimaryCategory = primaryCategory;
            Label = label;
            Description = description;
            Icon = icon;
            Img = img;
            ListType = listType;
            DoNotRenderIf = doNotRenderIf;
        }
    }
}
