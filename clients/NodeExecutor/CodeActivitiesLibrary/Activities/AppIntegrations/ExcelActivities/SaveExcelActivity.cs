using CodeActivitiesLibrary.AppIntegrations.ExcelActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using Excel = Microsoft.Office.Interop.Excel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Save Excel Workbook")]
    [Description("Saves the active Excel workbook.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class SaveExcelActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Excel Application")]
        [Description("The Excel Application object containing the workbook to save.")]
        public InArgument<Excel.Application> ExcelApplication { get; set; }

        [RequiredArgument]
        [DisplayName("Save Mode")]
        [Description("Specifies how to save the workbook.")]
        [DefaultValue(ExcelFileSaveModeEnum.SaveDocument)]
        public InArgument<ExcelFileSaveModeEnum> SaveMode { get; set; }

        [DisplayName("Select Format")]
        [Description("The file format to save the workbook as. This is required when 'Save Mode' is set to 'Save a Copy'.")]
        [RenderIfCondition(nameof(SaveMode), ExcelFileSaveModeEnum.SaveDocumentAs)]
        public InArgument<ExcelFileSaveFormatEnum> DocumentFormat { get; set; }

        [DisplayName("Document Path")]
        [Description("The file path to save the copy of the workbook. Extension will be determined by the selected format and will be ignored if already present in the path")]
        [RenderIfCondition(nameof(SaveMode), ExcelFileSaveModeEnum.SaveDocumentAs)]
        public InArgument<string> DocumentPath { get; set; }

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

                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error saving Excel: {ex.Message}";
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}