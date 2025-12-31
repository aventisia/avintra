using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;

namespace CodeActivityToJSON.Utils
{
    public static class ExportActivitiesToCsvUtil
    {
        public static void ExportActivitiesToCsv(List<Type> activities)
        {
            var activityClasses = new List<(string MainCategory, string SubCategory, string NodeName)>();

            foreach (var activity in activities)
            {
                // Split namespace to get MainCategory and SubCategory
                var namespaceParts = activity.Namespace?.Split('.') ?? new string[] { "Unknown Namespace" };

                // If the namespace has less than 3 parts, we assume no subcategory
                var mainCategory = namespaceParts.Length > 1 ? namespaceParts[1] : "No Main Category";
                var subCategory = namespaceParts.Length > 1 ? namespaceParts[2] : "No Subcategory";

                // If any CodeActivity has no display name which means its on hold
                var activityDisplayName = activity.GetCustomAttributes(typeof(DisplayNameAttribute), false).FirstOrDefault() as DisplayNameAttribute;
                if (activityDisplayName == null || string.IsNullOrEmpty(activityDisplayName.DisplayName))
                {
                    // Console.WriteLine($"Skipping {activity.Name} as it has no display name.");
                    continue;
                }

                // Get the NodeCategory and NodeName from the activity
                activityClasses.Add((
                    MainCategory: mainCategory,
                    SubCategory: subCategory,
                    NodeName: activityDisplayName.DisplayName
                ));
            }

            // Write to CSV
            var outputCsvPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
                "Downloads",
                "sample-activities-list.csv"
            );

            using (var writer = new StreamWriter(outputCsvPath))
            {
                writer.WriteLine("MainCategory,SubCategory,NodeName");
                foreach (var entry in activityClasses)
                {
                    writer.WriteLine($"{entry.MainCategory},{entry.SubCategory},{entry.NodeName}");
                }
            }
        }
    }
}