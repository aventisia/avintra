using FluentFTP;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace CodeActivitiesLibrary.AppIntegrations.FTPActivities.Helpers
{
    public static class FtpClientExtensions
    {
        public static string ExecuteCommand(this FtpClient client, string command)
        {
            // Implement based on known commands
            if (command.ToUpper() == "PWD")
            {
                return client.GetWorkingDirectory();
            }

            if (!command.ToUpper().StartsWith("CWD"))
                return client.GetWorkingDirectory();

            var dir = command.Split(' ')[1];
            client.SetWorkingDirectory(dir);
            return client.GetWorkingDirectory();

            // For more see RFC 959 - https://tools.ietf.org/html/rfc959
        }

        public static List<FtpListItem> GetFiles(this FtpClient client, string path, string searchPattern = "*")
        {
            var items = client.GetListing(path);
            var regex = new Regex(searchPattern.Replace(".", "\\.").Replace("*", ".*"));
            return items.Where(item =>
                item.Type == FtpObjectType.File && regex.IsMatch(item.Name)).ToList();
        }

        private static bool IsMatch(string fileName, string searchPattern)
        {
            if (searchPattern == "*")
                return true;
            var regex = new Regex(searchPattern.Replace(".", "\\.").Replace("*", ".*"));
            return regex.IsMatch(fileName);
        }
    }
}