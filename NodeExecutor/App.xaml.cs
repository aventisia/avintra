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

            string agentName = e.Args.Length > 0 ? e.Args[0] : "Agent Name";

            // You can now pass these to your main window or use as needed
            var mainWindow = new MainWindow(agentName);
            mainWindow.Show();
        }
    }
}
