using CodeActivitiesLibrary.Extensions;
using CodeActivityToJSON.Utils;
using System;
using System.Activities;
using System.Linq;
using System.Reflection;

namespace CodeActivityToJSON
{
    internal class Program
    {
        static void Main(string[] args)
        {
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
            CreateActivitiesMappingJsonUtil.CreateActivitiesMappingJson(categoryMetadataTypes, activities);

            // Copy the cloud connectors CloudConnectorActionSelectorMappingFile mapping JSON file
            CloudConnectorConfigFilesUtil.CopyConfigFiles();

            // Create the activities CSV file
            ExportActivitiesToCsvUtil.ExportActivitiesToCsv(activities);

            // Create Validation Errors CSV file
            ValidationErrosToCsvUtil.ValidationErrorsToCsv(activities);

            Console.WriteLine("Task complete");
            Console.ReadLine();
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
