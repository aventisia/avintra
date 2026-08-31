using System.Windows.Input;
using UIInspector.Core;

namespace UIInspector.ViewModels
{
    public class SupportedPatternViewModel : ObservableObject
    {
        public SupportedActionType SupportedAction { get; set; }
        public string ActionName { get; set; } // For display purposes, can be set to a user-friendly name if needed.
        public ICommand TestCommand { get; set; }
        public string ValueToSet { get; set; } // For ValuePattern etc.
    }

    public enum SupportedActionType
    {
        Invoke,
        Select,
        SetValue,
        GetValue,
        Toggle,
        ExpandOrCollapse,
        ItemContainer,
    }
}