using System;
using System.Activities;
using System.IO;
using System.Linq;
using System.Reflection;
using CodeActivitiesLibrary.Extensions;
using CodeActivityToJSON.Utils;

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
                if (activity.Name == "ConditionalActivity")
                {
                    Console.WriteLine("Skipping ConditionalActivity");
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
                Console.WriteLine($"{activity.Name + ".json"} saved");
            }

            Console.ReadLine();
        }

        // Create directory to save JSON files
        public static string GetOutputDirectoryToSaveJsonFiles()
        {
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
