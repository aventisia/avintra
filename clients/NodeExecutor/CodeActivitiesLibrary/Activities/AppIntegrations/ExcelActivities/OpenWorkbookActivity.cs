using CodeActivitiesLibrary.Extensions;
using Microsoft.Office.Interop.Excel;
using System;
using System.Activities;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Security;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    [DisplayName("Open Excel Workbook")]
    [Description("Opens or reuses an Excel workbook in an existing Excel instance by workbook name.")]
    [ActivityMetaData(nodeImg: "/assets/Excel.svg")]
    public class OpenWorkbookActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Excel Instance")]
        [Description("Existing Excel application instance.")]
        public InArgument<Application> ExcelInstance { get; set; }

        [RequiredArgument]
        [DisplayName("Workbook Name")]
        [Description("Workbook file name to open (example: Report.xlsx).")]
        public InArgument<string> WorkbookName { get; set; }

        [DisplayName("Open as ReadOnly")]
        [Description("If set to true, the workbook will be opened in read-only mode, preventing any changes from being saved.")]
        public InArgument<bool> OpenAsReadOnly { get; set; }

        [DisplayName("Read Protection Password")]
        [Description("Password required to open the workbook if it is protected with a read password.")]
        public InArgument<SecureString> ReadProtectionPassword { get; set; }

        [DisplayName("Workbook Instance")]
        [Description("The Excel workbook instance that is opened or reused. This output can be used in subsequent Excel activities.")]
        public OutArgument<Workbook> WorkbookInstance { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            Application excelApp = ExcelInstance.Get(context);
            string workbookName = WorkbookName.Get(context);
            bool readOnly = OpenAsReadOnly.Get(context);
            var password = ReadProtectionPassword.Get(context);

            bool isSuccess = false;
            string statusMessage;
            Workbook workbook = null;

            try
            {
                if (excelApp == null)
                    throw new ArgumentException("Excel instance is not provided.");

                if (string.IsNullOrWhiteSpace(workbookName))
                    throw new ArgumentException("Workbook name is not provided.");

                // Validate if workbook already open
                foreach (Workbook wb in excelApp.Workbooks)
                {
                    if (string.Equals(
                        Path.GetFileName(wb.FullName),
                        workbookName,
                        StringComparison.OrdinalIgnoreCase))
                    {
                        workbook = wb;
                        isSuccess = true;
                        statusMessage = "Workbook already open. Reused existing workbook.";

                        WorkbookInstance.Set(context, workbook);
                        IsSuccess.Set(context, isSuccess);
                        StatusMessage.Set(context, statusMessage);
                        return;
                    }
                }

                //Try to open workbook 
                workbook = excelApp.Workbooks.Open(
                    workbookName,
                    ReadOnly: readOnly,
                    Password: password
                );

                isSuccess = true;
                statusMessage = $"Workbook '{workbookName}' opened successfully.";
            }
            catch (Exception ex)
            {
                statusMessage = $"Error opening workbook '{workbookName}': {ex.Message}";
                workbook = null;
            }

            WorkbookInstance.Set(context, workbook);
            IsSuccess.Set(context, isSuccess);
            StatusMessage.Set(context, statusMessage);
        }
    }
}
