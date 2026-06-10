using CodeActivitiesLibrary.Extensions;
using CodeActivityToJSON.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;

namespace CodeActivityToJSON.Utils
{
    public static class CloudConnectorConfigFilesUtil
    {
        public static void CopyConfigFiles()
        {
            // Get initial base files/folders path
            var cloudConnectorsConfigFilesFolder = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "..", "apis", "WorcBackend-legacy", "WorkspaceAPIs", "Features", "CloudConnectors", "ConfigFiles"));
            var localAppDataPath = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);

            if (!Directory.Exists(cloudConnectorsConfigFilesFolder))
            {
                Console.WriteLine("Base JSON file not found at: " + cloudConnectorsConfigFilesFolder);
                return;
            }

            // --- Copy the CloudConnectorActionSelectorMappingFile.json file

            // Set mapping file source path
            var mappingFileSourcePath = Path.GetFullPath(Path.Combine(cloudConnectorsConfigFilesFolder, "CloudConnectorActionSelectorMappingFile.json"));
            
            // Save the CloudConnectorActionSelectorMappingFile.json JSON file to %LOCALAPPDATA%\AvintraDesktopApp\config-files\action-selector
            var localAppDataMappingFileOutputDir = Path.Combine(localAppDataPath, "AvintraDesktopApp", "config-files", "action-selector");
            Directory.CreateDirectory(localAppDataMappingFileOutputDir);
            var localAppDataMappingFileOutputFilePath = Path.Combine(localAppDataMappingFileOutputDir, "CloudConnectorActionSelectorMappingFile.json");
            File.Copy(mappingFileSourcePath, localAppDataMappingFileOutputFilePath, overwrite: true);
            Console.WriteLine($"CloudConnectorActionSelectorMappingFile mapping JSON copied to local app data");

            // Save the CloudConnectorActionSelectorMappingFile.json JSON file to desktop-app\config-files\action-selector
            var winRepoActionSelectorOutputDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "desktop-app", "src-tauri", "config-files", "action-selector");
            Directory.CreateDirectory(winRepoActionSelectorOutputDir);
            var winRepoActionSelectorOutputFilePath = Path.Combine(winRepoActionSelectorOutputDir, "CloudConnectorActionSelectorMappingFile.json");
            File.Copy(mappingFileSourcePath, winRepoActionSelectorOutputFilePath, overwrite: true);
            Console.WriteLine($"CloudConnectorActionSelectorMappingFile mapping JSON copied to desktop-app");

            // --- Copy all cloud connectors config files to cloud-connectors folder
            var localAppDataConfigFileOutputDir = Path.Combine(localAppDataPath, "AvintraDesktopApp", "config-files", "cloud-connectors");
            Directory.CreateDirectory(localAppDataConfigFileOutputDir);
            var winRepoConfigFileOutputDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "desktop-app", "src-tauri", "config-files", "cloud-connectors");
            Directory.CreateDirectory(winRepoConfigFileOutputDir);

            // Copy only .json files from the source folder and all sub folders to the target folders. Keep the same file name and sub folder structure
            foreach (var file in Directory.GetFiles(cloudConnectorsConfigFilesFolder, "*.json", SearchOption.AllDirectories))
            {
                var relativePath = file.Substring(cloudConnectorsConfigFilesFolder.Length).TrimStart(Path.DirectorySeparatorChar);
                // Save to local app data
                var localAppDataFilePath = Path.Combine(localAppDataConfigFileOutputDir, relativePath);
                Directory.CreateDirectory(Path.GetDirectoryName(localAppDataFilePath));
                File.Copy(file, localAppDataFilePath, overwrite: true);
                
                // Save to windows repo
                var winRepoFilePath = Path.Combine(winRepoConfigFileOutputDir, relativePath);
                Directory.CreateDirectory(Path.GetDirectoryName(winRepoFilePath));
                File.Copy(file, winRepoFilePath, overwrite: true);
            }
            Console.WriteLine($"Cloud connectors config files copied to local app data and Windows repo");
        }
    }
}
