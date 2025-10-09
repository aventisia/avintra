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

            string wsPort = e.Args.Length > 0 ? e.Args[0] : "9001";
            string agentName = e.Args.Length > 1 ? e.Args[1] : "Agent Name";
            string accessToken = e.Args.Length > 2 ? e.Args[2] : "";

            // You can now pass these to your main window or use as needed
            var mainWindow = new MainWindow(wsPort, agentName, accessToken);
            mainWindow.Show();
        }
    }
}
