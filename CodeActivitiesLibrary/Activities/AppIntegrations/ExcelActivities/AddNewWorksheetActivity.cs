using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Add New Worksheet")]
    [Description("Adds a new worksheet to the specified Excel workbook.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class AddNewWorksheetActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Workbook Instance")]
        [Description("The Excel Workbook object where the new worksheet will be added.")]
        public InArgument<Excel.Workbook> WorkbookInstance { get; set; }

        [DisplayName("New Worksheet Name")]
        [Description("The name of the new worksheet to be created.")]
        public InArgument<string> NewWorksheetName { get; set; }

        [RequiredArgument]
        [DisplayName("Add Worksheet As")]
        [Description("Specifies whether to add the worksheet as the first or last sheet.")]
        [DefaultValue(ExcelWorksheetPositionEnum.First)]
        public InArgument<ExcelWorksheetPositionEnum> AddWorksheetAs { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var workbook = WorkbookInstance.Get(context);
                var newWorksheetName = NewWorksheetName.Get(context);
                var addWorksheetAs = AddWorksheetAs.Get(context);

                if (workbook == null)
                    throw new InvalidOperationException("Workbook instance is not available.");

                // Create a new worksheet
                Excel.Worksheet newSheet = workbook.Sheets.Add();

                // Set the name of the new worksheet
                if (!string.IsNullOrWhiteSpace(newWorksheetName))
                    newSheet.Name = newWorksheetName;
                else
                    newSheet.Name = $"Sheet{workbook.Sheets.Count + 1}";

                // Position the new worksheet
                switch (addWorksheetAs)
                {
                    case ExcelWorksheetPositionEnum.First:
                        newSheet.Move(Before: workbook.Sheets[1]);
                        break;

                    case ExcelWorksheetPositionEnum.Last:
                        newSheet.Move(After: workbook.Sheets[workbook.Sheets.Count]);
                        break;

                    default:
                        throw new ArgumentOutOfRangeException(nameof(addWorksheetAs));
                }

                status += $" Added new worksheet named '{newSheet.Name}'.";
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error adding new worksheet: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }

    // Enum for specifying the position of the new worksheet
    public enum ExcelWorksheetPositionEnum
    {
       [Display(Name = "First worksheet", Description = "First worksheet")]
       First,

       [Display(Name = "Last worksheet", Description = "Last worksheet")]
       Last
    }
}