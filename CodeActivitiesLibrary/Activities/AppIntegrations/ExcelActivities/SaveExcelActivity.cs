using System;
using System.Activities;
using System.ComponentModel;
using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Save Excel Workbook")]
    [Description("Saves the active Excel workbook.")]
    public class SaveExcelActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the workbook to save.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Save Mode")]
        [Description("Specifies how to save the workbook.")]
        [DefaultValue(ExcelFileSaveModeEnum.SaveDocument)]
        public InArgument<ExcelFileSaveModeEnum> SaveMode { get; set; }

        [Category("Input")]
        [DisplayName("Document Path")]
        [Description("The file path to save the workbook (required if 'Save Mode' is 'Save Document As').")]
        [RenderIfCondition(nameof(SaveMode), "SaveDocumentAs")]
        public InArgument<string> DocumentPath { get; set; }

        [Category("Input")]
        [DisplayName("Document Format")]
        [Description("The file format to save the workbook as (required if 'Save Mode' is 'Save Document As').")]
        [RenderIfCondition(nameof(SaveMode), "SaveDocumentAs")]
        public InArgument<ExcelFileSaveFormatEnum> DocumentFormat { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")] 

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var excelApp = ExcelApplication.Get(context);
                var saveMode = SaveMode.Get(context);

                if (excelApp?.ActiveWorkbook == null)
                    throw new InvalidOperationException("Excel application or workbook is not available.");

                switch (saveMode)
                {
                    case ExcelFileSaveModeEnum.SaveDocument:
                        {
                            // Save the active workbook in its current format
                            excelApp.ActiveWorkbook.Save();
                            break;
                        }

                    case ExcelFileSaveModeEnum.SaveDocumentAs:
                        {
                            var documentPath = DocumentPath.Get(context);
                            var documentFormat = DocumentFormat.Get(context);

                            if (string.IsNullOrWhiteSpace(documentPath))
                                throw new ArgumentException(
                                    "Document path cannot be empty when using 'Save Document As' mode.");

                            // Save the active workbook with the specified format and path
                            excelApp.ActiveWorkbook.SaveAs(
                                documentPath,
                                documentFormat,
                                CreateBackup: false
                            );
                            break;
                        }

                    default:
                        throw new ArgumentOutOfRangeException(nameof(saveMode));
                }
            }
            catch (Exception ex)
            {
                status = $"Error saving Excel: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}