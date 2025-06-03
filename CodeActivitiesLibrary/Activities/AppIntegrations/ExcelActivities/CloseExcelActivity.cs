using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Runtime.InteropServices;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Close Excel Application")]
    [Description("Closes the active Excel application instance and optionally saves changes.")]
    public class CloseExcelActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]

        [DisplayName("Excel Application")]
        [Description("The Excel Application object to close.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }


        [DisplayName("Before Closing Excel")]
        [Description("Specifies what to do before closing Excel.")]
        [DefaultValue(ExcelCloseOptionEnum.SaveDocument)]
        public InArgument<ExcelCloseOptionEnum> BeforeClosingExcel { get; set; }


        [DisplayName("Save Path")]
        [Description("The file path to save the document when 'Save Document As' is selected.")]
        [RenderIfCondition(nameof(BeforeClosingExcel), "SaveDocumentAs")]
        public InArgument<string> SavePath { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var excelApp = ExcelApplication.Get(context);
                var closeOption = BeforeClosingExcel.Get(context);

                if (excelApp == null)
                    throw new InvalidOperationException("Excel Application is null.");

                excelApp.DisplayAlerts = false;

                switch (closeOption)
                {
                    case ExcelCloseOptionEnum.DoNotSaveDocument:
                        // Close without saving
                        break;

                    case ExcelCloseOptionEnum.SaveDocument:
                        // Save changes before closing
                        excelApp.ActiveWorkbook.Save();
                        break;

                    case ExcelCloseOptionEnum.SaveDocumentAs:
                        {
                            var savePath = SavePath.Get(context);

                            if (string.IsNullOrWhiteSpace(savePath))
                                throw new ArgumentException("Save Path cannot be empty when saving as.");

                            excelApp.ActiveWorkbook.SaveAs(savePath);
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(closeOption));
                }

                excelApp.Quit();

                // Release COM objects
                Marshal.ReleaseComObject(excelApp.ActiveWorkbook);
                Marshal.ReleaseComObject(excelApp);
            }
            catch (Exception ex)
            {
                status = $"Error closing Excel: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}