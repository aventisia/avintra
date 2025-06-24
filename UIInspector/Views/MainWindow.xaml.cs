using FlaUI.Core;
using System.Reflection;
using System.Windows;
using System.Windows.Controls;
using UIInspector.ViewModels;

namespace UIInspector.Views
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow
    {
        private readonly MainViewModel _vm;

        public MainWindow()
        {
            InitializeComponent();
            AppendVersionToTitle();
            Loaded += MainWindow_Loaded;
            _vm = new MainViewModel();
            DataContext = _vm;
        }

        private void AppendVersionToTitle()
        {
            var attr = Assembly.GetEntryAssembly().GetCustomAttribute(typeof(AssemblyInformationalVersionAttribute)) as AssemblyInformationalVersionAttribute;
            if (attr != null)
            {
                Title += " v" + attr.InformationalVersion;
            }
        }

        private void MainWindow_Loaded(object sender, System.EventArgs e)
        {
            if (!_vm.IsInitialized)
            {
                // Passing UIA3
                _vm.Initialize(AutomationType.UIA3);
                Loaded -= MainWindow_Loaded;
            }
        }

        private void MenuItem_Click(object sender, RoutedEventArgs e)
        {
            Close();
        }

        private void TreeViewSelectedHandler(object sender, RoutedEventArgs e)
        {
            var item = sender as TreeViewItem;
            if (item != null)
            {
                item.BringIntoView();
                e.Handled = true;
            }
        }
    }
}
