using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.AppIntegrations.ExcelActivities
{
    // Activity to activate a cell in an Excel worksheet
    [DisplayName("Activate Cell in Excel Worksheet")]
    [Description(
        "Activates a cell in the active worksheet of an Excel instance, by providing column, row, and offset.")]
    public class ActivateCellInExcelWorksheetActivity : CodeActivity
    {
        #region Inputs

        [RequiredArgument, Category("Input"), Description("The Excel instance ID or token.")]
        public InArgument<string> ExcelInstanceId { get; set; }

        [Category("Input"), Description("Select whether to specify the cell to activate absolutely or relatively.")]
        public InArgument<string> Activate { get; set; }

        [Category("Input"), Description("The numeric value or letter of the cell column."), RequiredArgument]
        public InArgument<string> Column { get; set; }

        [Category("Input"), Description("The numeric value of the cell row. The numbering starts from 1."),
         RequiredArgument]
        public InArgument<int> Row { get; set; }

        [Category("Input"), Description("The name of the cells.")]
        public InArgument<string> Name { get; set; }

        [Category("Input"),
         Description(
             "Select where to look for the cell to activate based on the position of the currently active cell.")]
        public InArgument<string> Direction { get; set; }

        [Category("Input"),
         Description(
             "Offset distance between the currently active cell and the desired cell. The numbering starts from 0.")]
        public InArgument<int> OffsetFromActiveCell { get; set; }

        #endregion

        #region Outputs

        [Category("Output"), Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            // Retrieve input arguments
            var excelInstanceId = ExcelInstanceId.Get(context);
            var activateMode = Activate.Get(context);
            var columnInput = Column.Get(context);
            var rowInput = Row.Get(context);
            var nameInput = Name.Get(context);
            var directionInput = Direction.Get(context);
            var offsetFromActiveCell = OffsetFromActiveCell.Get(context);

            var status = "";

            try
            {
                switch (activateMode)
                {
                    case "absolutely specified cell":
                        status = $"Simulated activation of cell at column '{columnInput}', row {rowInput} in Excel instance '{excelInstanceId}'.";
                        break;
                    case "relatively specified cell":
                        status = $"Simulated activation of cell relative to the current active cell, offset by {offsetFromActiveCell} cells in direction '{directionInput}' in Excel instance '{excelInstanceId}'.";
                        break;
                    case "cells with name":
                        status = $"Simulated activation of cell named '{nameInput}' in Excel instance '{excelInstanceId}'.";
                        break;
                    default:
                        status = "Invalid activation mode specified.";
                        break;
                }
            }
            catch (Exception ex)
            {
                status = $"Error activating cell: {ex.Message}";
            }

            // Set the output status message
            StatusMessage.Set(context, status);
        }
    }
}