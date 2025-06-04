using CodeActivitiesLibrary.Extensions;
using CodeActivityToJSON.Utils;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Reflection;

namespace CodeActivityToJSON
{
    internal class Program
    {
        static void Main(string[] args)
        {
            // Get the directory to save JSON files
            var outputDir = GetOutputDirectoryToSaveJsonFiles();

            // Load the CodeActivitiesLibrary assembly
            var codeActivitiesAssembly = GetCodeActivitiesAssembly();

            // Search all types with the [ActivityCategoryMetadata] attribute
            var categoryMetadataTypes = codeActivitiesAssembly
                .GetTypes()
                .Where(t => t.GetCustomAttributes(typeof(ActivityCategoryMetadataAttribute), inherit: false).Any())
                .ToList();

            // Get all CodeActivity types from the referenced assembly
            var activities = codeActivitiesAssembly
                                .GetTypes()
                                .Where(w => typeof(CodeActivity).IsAssignableFrom(w) && !w.IsAbstract)
                                .ToList();

            var nativeActivities = codeActivitiesAssembly
                                .GetTypes()
                                .Where(w => typeof(NativeActivity).IsAssignableFrom(w) && !w.IsAbstract)
                                .ToList();

            // Add nativeActivities to activities
            activities.AddRange(nativeActivities);

            // Check if any activities were found
            if (activities.Count == 0)
            {
                Console.WriteLine("No CodeActivity classes found in the assembly.");
                return;
            }

            CreateActivitiesMappingJsonUtil.CreateActivitiesMappingJson(outputDir, categoryMetadataTypes, activities);

            // Convert each activity to JSON and save to file
            foreach (var activity in activities)
            {
                // Skip if activity is ConditionalActivity 
                // TODO: Find a better way to skip ConditionalActivity or generate json from it 
                if (activity.Name == "ConditionalActivity" || activity.Name == "ConditionalBranchActivity" || activity.Name == "LoopActivity")
                {
                    Console.WriteLine($"Skipping {activity.Name}");
                    continue;
                }

                // If any CodeActivity has no display name which means we don't want to generate JSON for it
                var activityDisplayName = activity.GetCustomAttributes(typeof(DisplayNameAttribute), false).FirstOrDefault() as DisplayNameAttribute;
                if (activityDisplayName == null || string.IsNullOrEmpty(activityDisplayName.DisplayName))
                {
                    Console.WriteLine($"Skipping {activity.Name} as it has no display name.");
                    continue;
                }

                var json = ConvertActivityToJsonUtil.ConvertActivityToJson(activity);
                if (string.IsNullOrEmpty(json) || json == "[]")
                {
                    Console.WriteLine($"Failed to convert {activity.Name} to JSON.");
                    continue;
                }

                var fileName = Path.Combine(outputDir, activity.Name + ".json");
                File.WriteAllText(fileName, json);
                //Console.WriteLine($"{activity.Name + ".json"} saved");
            }

            Console.ReadLine();
        }

        // Create directory to save JSON files
        public static string GetOutputDirectoryToSaveJsonFiles()
        {
            return @"C:\My Space\Gitea\Aventisia\studio\src\features\dynamic-config-panel\constants\config-json";
            // Get user's Downloads folder
            var downloadsPath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
                "Downloads",
                "ActivityJson"
            );

            // If the directory already exists, delete it
            if (Directory.Exists(downloadsPath))
                Directory.Delete(downloadsPath, true);

            // Create the directory
            Directory.CreateDirectory(downloadsPath);

            return downloadsPath;
        }

        // Get the CodeActivitiesLibrary assembly
        static Assembly GetCodeActivitiesAssembly()
        {
            // Force-load the assembly by name
            var codeActivitiesAssembly = AppDomain.CurrentDomain.GetAssemblies()
                .FirstOrDefault(a => a.GetName().Name == "CodeActivitiesLibrary");

            if (codeActivitiesAssembly == null)
            {
                // Load manually if not already loaded
                codeActivitiesAssembly = Assembly.Load("CodeActivitiesLibrary");
            }

            return codeActivitiesAssembly;
        }
    }
}
