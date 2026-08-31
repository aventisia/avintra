using System.Collections.Generic;
using UIInspector.Core;

namespace UIInspector.ViewModels
{
    public class DetailGroupViewModel : ObservableObject
    {
        public DetailGroupViewModel(string name, IEnumerable<IDetailViewModel> details)
        {
            Name = name;
            Details = new ExtendedObservableCollection<IDetailViewModel>(details);
        }

        public string Name { get { return GetProperty<string>(); } set { SetProperty(value); } }

        public ExtendedObservableCollection<IDetailViewModel> Details { get; set; }
    }
}
