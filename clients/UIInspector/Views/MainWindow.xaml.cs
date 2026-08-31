using FlaUI.Core;
using System.Reflection;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using UIInspector.ViewModels;
using UIInspector.Helpers;

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

            // Subscribe to the event and call the scroll reset method
            _vm.RequestTreeScrollReset += TreeScrollReset;
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

                // Get the selected ElementViewModel
                if (item.DataContext is ElementViewModel selectedElement)
                {
                    // Call ElementToSelectChanged on the ViewModel
                    _vm.ElementToSelectChanged(selectedElement.AutomationElement);
                }
            }
        }

        private void NameTextBox_LostFocus(object sender, RoutedEventArgs e)
        {
            var textBox = sender as TextBox;
            if (textBox != null)
            {
                var binding = textBox.GetBindingExpression(TextBox.TextProperty);
                binding?.UpdateSource();
            }
        }

        private void NameTextBox_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Enter)
            {
                var textBox = sender as TextBox;
                if (textBox != null)
                {
                    var binding = textBox.GetBindingExpression(TextBox.TextProperty);
                    binding?.UpdateSource();
                    // Optionally move focus away to trigger LostFocus
                    Keyboard.ClearFocus();
                }
            }
        }

        private void TreeScrollReset()
        {
            var scrollViewer = FindVisualChildHelpers.FindVisualChild<ScrollViewer>(UIElementsTree);
            if (scrollViewer != null)
            {
                scrollViewer.ScrollToHorizontalOffset(0);
                scrollViewer.ScrollToVerticalOffset(0);
            }
        }
    }
}
