using System;
using System.Configuration;
using System.Windows;

namespace NodeExecutor
{
    /// <summary>
    /// Interaction logic for App.xaml
    /// </summary>
    public partial class App : Application
    {
        protected override void OnStartup(StartupEventArgs e)
        {
            base.OnStartup(e);

            string appBaseUrl = e.Args.Length > 0 ? e.Args[0] : "https://avintra.aventisia.com";
            string wsPort = e.Args.Length > 1 ? e.Args[1] : "9001";
            string agentId = e.Args.Length > 2 ? e.Args[2] : Guid.Empty.ToString();
            string agentName = e.Args.Length > 3 ? e.Args[3] : "Agent Name";
            string inputArgumentsJson = e.Args.Length > 4 ? e.Args[4] : "{}";
            string accessToken = e.Args.Length > 5 ? e.Args[5] : "";

            // Update the APP_BASE_URL configuration value
            UpdateAppSetting("APP_BASE_URL", appBaseUrl);

            // You can now pass these to your main window or use as needed
            var mainWindow = new MainWindow(wsPort, agentId, agentName, inputArgumentsJson, accessToken);
            mainWindow.Show();
        }

        private void UpdateAppSetting(string key, string value)
        {
            try
            {
                var configuration = ConfigurationManager.OpenExeConfiguration(ConfigurationUserLevel.None);
                if (configuration.AppSettings.Settings[key] != null)
                {
                    configuration.AppSettings.Settings[key].Value = value;
                }
                else
                {
                    configuration.AppSettings.Settings.Add(key, value);
                }
                configuration.Save(ConfigurationSaveMode.Modified);
                ConfigurationManager.RefreshSection("appSettings");
            }
            catch (Exception ex)
            {
                // Log or handle the error as needed
                System.Diagnostics.Debug.WriteLine($"Failed to update app setting '{key}': {ex.Message}");
            }
        }
    }
}
