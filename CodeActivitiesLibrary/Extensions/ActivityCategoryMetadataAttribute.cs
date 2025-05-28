using System;

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
        public ActivityCategoryMetadataAttribute(
            string primaryCategory,
            string label,
            string description,
            string icon = null,
            string img = null,
            string listType = null)
        {
            PrimaryCategory = primaryCategory;
            Label = label;
            Description = description;
            Icon = icon;
            Img = img;
            ListType = listType;
        }
    }
}
