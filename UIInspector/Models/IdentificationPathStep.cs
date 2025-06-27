using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace UIInspector.Models
{
    public class IdentificationPathStep : INotifyPropertyChanged
    {
        private string _name;
        private string _originalName;
        private NameMatchModeEnum _nameMatchMode;

        public string Name
        {
            get => _name;
            set
            {
                if (_name != value)
                {
                    // Only update if not empty, else revert
                    if (string.IsNullOrEmpty(value))
                    {
                        _name = _originalName;
                    }
                    else
                    {
                        _name = value;
                    }
                    OnPropertyChanged(nameof(Name));
                }
            }
        }
        /// <summary>
        /// Call this ONCE when you load the original value (e.g., when building the path step)
        /// </summary>
        public void SetOriginalName(string name)
        {
            _originalName = name;
            OriginalName = name;
            _name = name;
            OnPropertyChanged(nameof(Name));
            OnPropertyChanged(nameof(OriginalName));
        }

        public string OriginalName { get; set; }
        public string PathHeading { get; set; }
        public string Index { get; set; }
        public NameMatchModeEnum NameMatchMode
        {
            get => _nameMatchMode;
            set
            {
                if (_nameMatchMode != value)
                {
                    _nameMatchMode = value;
                    OnPropertyChanged();
                }
            }
        }
        public string ClassName { get; set; }
        public string ControlType { get; set; }
        public string FrameworkId { get; set; }
        public string AutomationId { get; set; }

        public bool IsIndexSelected { get; set; } = false;
        public bool IsNameSelected { get; set; } = true;
        public bool IsClassNameSelected { get; set; } = true;
        public bool IsControlTypeSelected { get; set; } = true;
        public bool IsFrameworkIdSelected { get; set; } = true;
        public bool IsAutomationIdSelected { get; set; } = false;


        public event PropertyChangedEventHandler PropertyChanged;

        protected void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public enum NameMatchModeEnum
    {
        Equals,
        Contains,
        StartsWith
    }
}