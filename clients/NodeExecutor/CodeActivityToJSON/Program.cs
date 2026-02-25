using CodeActivitiesLibrary.Extensions;
using CodeActivityToJSON.Utils;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;

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
                                .Where(w => (typeof(CodeActivity).IsAssignableFrom(w) || typeof(NativeActivity).IsAssignableFrom(w) || typeof(AsyncCodeActivity).IsAssignableFrom(w)) && !w.IsAbstract)
                                .ToList();

            // Check if any activities were found
            if (activities.Count == 0)
            {
                Console.WriteLine("No CodeActivity classes found in the assembly.");
                return;
            }

            // Create the activities mapping JSON file
            CreateActivitiesMappingJsonUtil.CreateActivitiesMappingJson(outputDir, categoryMetadataTypes, activities);

            // Create the activities CSV file
            ExportActivitiesToCsvUtil.ExportActivitiesToCsv(activities);

            // Create Validation Errors CSV file
            ValidationErrosToCsvUtil.ValidationErrorsToCsv(activities);

            // Convert each activity to JSON and save to file
            foreach (var activity in activities)
            {
                // Skip if activity is ConditionalActivity 
                // TODO: Find a better way to skip ConditionalActivity or generate json from it 
                if (activity.Name == "ConditionalActivity" || 
                    activity.Name == "ConditionalBranchActivity" || 
                    activity.Name == "LoopActivity" || 
                    activity.Name == "GetWorkItemActivity")
                {
                    // Console.WriteLine($"Skipping {activity.Name}");
                    continue;
                }

                // If any CodeActivity has no display name which means we don't want to generate JSON for it
                var activityDisplayName = activity.GetCustomAttributes(typeof(DisplayNameAttribute), false).FirstOrDefault() as DisplayNameAttribute;
                if (activityDisplayName == null || string.IsNullOrEmpty(activityDisplayName.DisplayName))
                {
                    // Console.WriteLine($"Skipping {activity.Name} as it has no display name.");
                    continue;
                }

                var json = ConvertActivityToJsonUtil.ConvertActivityToJson(activity);
                if (string.IsNullOrEmpty(json) || json == "[]")
                {
                    Console.WriteLine($"Failed to convert {activity.Name} to JSON.");
                    continue;
                }

                // Split the namespace to get the folder structure
                var namespaceParts = activity.Namespace.Replace("CodeActivitiesLibrary", "").Trim().Split('.');

                // Loop through the namespace parts to create a directory structure
                for (int i = 0; i < namespaceParts.Length; i++)
                {
                    // If the part is empty, skip it
                    if (string.IsNullOrEmpty(namespaceParts[i]))
                        continue;

                    // Replace "Activities" with an empty string
                    namespaceParts[i] = namespaceParts[i].Replace("Activities", "").Trim();

                    // Convert PascalCase to kebab-case (lowercase with hyphens)
                    namespaceParts[i] = Regex.Replace(namespaceParts[i], "(?<!^)([A-Z])", "-$1").ToLower();
                }

                // Create the directory structure based on the namespace
                var directoryPath = Path.Combine(outputDir, Path.Combine(namespaceParts));

                // Create the file path for the JSON file (for documentation)
                //Directory.CreateDirectory(directoryPath);
                //var fileName = Path.Combine(directoryPath, activityDisplayName.DisplayName + ".json");

                // Create the file path for the JSON file (for form generation)
                var fileName = Path.Combine(outputDir, activity.Name + ".json");

                // Write the JSON content to the file with Unix line endings (LF)
                var jsonWithUnixLineEndings = json.Replace("\r\n", "\n");
                File.WriteAllText(fileName, jsonWithUnixLineEndings);
            }
            Console.WriteLine("Task complete");
            Console.ReadLine();
        }

        // Create directory to save JSON files
        public static string GetOutputDirectoryToSaveJsonFiles()
        {
            // Get docs generation input folder (for documentation)
            // return @"C:\Users\Gaurav\Gitea\Aventisia\OpenAI Doc Generation\input";

            // Get user's agent builder directory (for form generation)
            var outputDir = $@"\\wsl$\Ubuntu\home\{Environment.UserName.ToLower()}\gitea\aventisia\worc-platform\clients\worc-web-legacy\studio\src\features\dynamic-config-panel\constants\config-json";
            
            // If the directory already exists, delete it
            if (Directory.Exists(outputDir))
                Directory.Delete(outputDir, true);

            // Create the directory
            Directory.CreateDirectory(outputDir);

            return outputDir;
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
