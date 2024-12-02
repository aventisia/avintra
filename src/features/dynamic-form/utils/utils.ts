import clickDownloadLinkOnWebPage from "../constants/configs/browser-automation/click-download-link-on-web-page";
import clickLinkOnWebPage from "../constants/configs/browser-automation/click-link-on-web-page";
import closeWebBrowser from "../constants/configs/browser-automation/close-web-browser";
import createNewTab from "../constants/configs/browser-automation/create-new-tab";
import goToWebPage from "../constants/configs/browser-automation/go-to-web-page";
import hoverMouseOverElementOnWebPage from "../constants/configs/browser-automation/hover-mouse-over-element-on-web-page";
import ifWebPageContains from "../constants/configs/browser-automation/if-web-page-contains";
import launchNewChrome from "../constants/configs/browser-automation/launch-new-chrome";
import launchNewFirefox from "../constants/configs/browser-automation/launch-new-firefox";
import launchNewInternetExplorer from "../constants/configs/browser-automation/launch-new-internet-explorer";
import launchNewIMicrosoftEdge from "../constants/configs/browser-automation/launch-new-microsoft-edge";
import runJavascriptFunctionOnWebPage from "../constants/configs/browser-automation/run-javascript-function-on-web-page";
import waitForWebPageContent from "../constants/configs/browser-automation/wait-for-web-page-content";
import extractDataFromWebPage from "../constants/configs/browser-automation/web-data-extraction/extract-data-from-web-page";
import getDetailsOfElementOnWebPage from "../constants/configs/browser-automation/web-data-extraction/get-details-of-element-on-web-page";
import getDetailsOfWebPage from "../constants/configs/browser-automation/web-data-extraction/get-details-of-web-page";
import takeScreenshotOfWebPage from "../constants/configs/browser-automation/web-data-extraction/take-screenshot-of-web-page";
import focusTextFieldOnWebPage from "../constants/configs/browser-automation/web-form-filling/focus-text-field -on-web-page";
import populateTextFieldOnWebPage from "../constants/configs/browser-automation/web-form-filling/populate-text-field -on-web-page";
import pressButtonOnWebPage from "../constants/configs/browser-automation/web-form-filling/press-button-on-web-page";
import selectRadioButtonOnWebPage from "../constants/configs/browser-automation/web-form-filling/select-radio-button-on-web-page";
import setCheckboxStateOnWebPage from "../constants/configs/browser-automation/web-form-filling/set-checkbox-state-on-web-page";
import setDropDownListValueOnWebPage from "../constants/configs/browser-automation/web-form-filling/set-drop-down-list-value-on-web-page";
import getClipboardText from "../constants/configs/clipboard/get-clipboard-text";
import setClipboardText from "../constants/configs/clipboard/set-clipboard-text";
import closeCmdSession from "../constants/configs/CMD Session/close-cmd-session";
import openCmdSession from "../constants/configs/CMD Session/open-cmd-session";
import readFromCmdSession from "../constants/configs/CMD Session/read-from-cmd-session";
import waitForTextOnCmdSession from "../constants/configs/CMD Session/wait-for-text-on-cmd-session";
import writeToCmdSession from "../constants/configs/CMD Session/write-to-cmd-session";
import unzipFiles from "../constants/configs/compression/unzip-files";
import zipFiles from "../constants/configs/compression/zip-files";
import conditionalCase from "../constants/configs/conditionals/case";
import elseIfCondition from "../constants/configs/conditionals/else-if-condition";
import ifCondition from "../constants/configs/conditionals/if-condition";
import switchCase from "../constants/configs/conditionals/swtich";
import decryptTextWithAes from "../constants/configs/cryptography/decrypt-text-with-aes";
import decryptToFileWithAes from "../constants/configs/cryptography/decrypt-to-file-with-aes";
import encryptFromFileWithAes from "../constants/configs/cryptography/encrypt-from-file-with-aes";
import encryptTextWithAes from "../constants/configs/cryptography/encrypt-text-with-aes";
import hashFromFile from "../constants/configs/cryptography/hash-from-file";
import hashFromFileWithKey from "../constants/configs/cryptography/hash-from-file-with-aes";
import hashText from "../constants/configs/cryptography/hash-text";
import hashTextWithKey from "../constants/configs/cryptography/hash-text-with-key";
import closeSQLConnection from "../constants/configs/Database/close-sql-connection";
import executeSQLStatement from "../constants/configs/Database/execute-sql-statement";
import openSQLConnection from "../constants/configs/Database/open-sql-connection";
import addToDateTime from "../constants/configs/DateTime/add-to-data-time";
import getCurrentDateAndTime from "../constants/configs/DateTime/get-current-date-and-time";
import subtractDates from "../constants/configs/DateTime/subtract-dates";
import processEmailMessages from "../constants/configs/email/process-email-messages";
import retrieveEmailMessages from "../constants/configs/email/retrieve-email-messages";
import sendEmail from "../constants/configs/email/send-email";
import addNewWorksheet from "../constants/configs/Excel/add-new-worksheet";
import activateCellInExcelWorksheet from "../constants/configs/Excel/advanced/activate-cell-in-excel-worksheet";
import appendCellsInExcelWorksheet from "../constants/configs/Excel/advanced/append-cell-in-excel-worksheet";
import autoFillCellsInExcelWorksheet from "../constants/configs/Excel/advanced/auto-fill-cell-in-excel-worksheet";
import copyCellsFromExcelWorksheet from "../constants/configs/Excel/advanced/copy-cell-from-excel-worksheet";
import copyExcelWorksheet from "../constants/configs/Excel/advanced/copy-excel-worksheet";
import deleteColumnFromExcelWorksheet from "../constants/configs/Excel/advanced/delete-column-from-excel-worksheet";
import deleteExcelWorksheet from "../constants/configs/Excel/advanced/delete-excel -worksheet";
import deleteFromExcelWorksheet from "../constants/configs/Excel/advanced/delete-from-excel -worksheet";
import deleteRowFromExcelWorksheet from "../constants/configs/Excel/advanced/delete-row-from-excel-worksheet";
import findsAndReplaceCellsInExcelWorksheet from "../constants/configs/Excel/advanced/find-and-replace-cells-in-excel-worksheet";
import getActiveCellOnExcelWorksheet from "../constants/configs/Excel/advanced/get-active-excel-worksheet";
import getActiveExcelWorksheet from "../constants/configs/Excel/advanced/get-active-excel-worksheet";
import getAllExcelWorksheets from "../constants/configs/Excel/advanced/get-all-excel-worksheet";
import getFirstFreeColumnRowFromExcelWorksheet from "../constants/configs/Excel/advanced/get-first-free-row-on-column-from-excel";
import getFirstFreeRowOnColumnFromExcelWorksheet from "../constants/configs/Excel/advanced/get-first-free-row-on-column-from-excel";
import getSelectedCellRangeFromExcelWorksheet from "../constants/configs/Excel/advanced/get-selected-cell-range-from-excel-worksheet";
import getTableRangeFromExcelWorksheet from "../constants/configs/Excel/advanced/get-table-range-from-excel-worksheet";
import insertColumnToExcelWorksheet from "../constants/configs/Excel/advanced/insert-column-to-excel-worksheet";
import insertRowToExcelWorksheet from "../constants/configs/Excel/advanced/insert-row-to-excel-worksheet";
import lookupRangeInExcelWorksheet from "../constants/configs/Excel/advanced/lookup-range-in-excel-worksheet";
import pasteCellsToExcelWorksheet from "../constants/configs/Excel/advanced/paste-cell-to-excel-worksheet";
import readFormulaFromExcel from "../constants/configs/Excel/advanced/read-formula-from-excel";
import renameExcelWorksheet from "../constants/configs/Excel/advanced/rename-excel-worksheet";
import runExcelMacro from "../constants/configs/Excel/advanced/run-excel-macro";
import selectCellsInExcelWorksheet from "../constants/configs/Excel/advanced/select-cell-in-excel-worksheet";
import setColorOfCellsInExcelWorksheet from "../constants/configs/Excel/advanced/set-color-of-cell-in-excel-worksheet";
import attachToRunningExcel from "../constants/configs/Excel/attach-to-running-excel";
import clearCellsInExcelWorksheet from "../constants/configs/Excel/clear-cells-in-excel-worksheet";
import closeExcel from "../constants/configs/Excel/close-excel";
import filterCellsInExcelWorksheet from "../constants/configs/Excel/filter-cells-in-excel-worksheet";
import getColumnNameOnExcelWorksheet from "../constants/configs/Excel/get-column-name-of-the-column";
import launchExcel from "../constants/configs/Excel/launch-excel";
import readFromExcelWorksheet from "../constants/configs/Excel/read-from-excel-worksheet";
import resizeColumnsRows from "../constants/configs/Excel/resize-columns-rows";
import saveExcel from "../constants/configs/Excel/save-excel";
import setActiveExcelWorksheet from "../constants/configs/Excel/set-active-excel-worksheet";
import writeToExcelWorksheet from "../constants/configs/Excel/write-to-excel-worksheet";
import connectToExchangeServer from "../constants/configs/exchange-server/connect-to-exchange-server";
import processExchangeEmailMessages from "../constants/configs/exchange-server/process-exchange-email-messages";
import retrieveExchangeEmailMessages from "../constants/configs/exchange-server/retrieve-exchange-email-messages";
import sendExchangeEmailMessage from "../constants/configs/exchange-server/send-exchange-email-message";
import convertBase64ToText from "../constants/configs/Files/convert-base64-to-text";
import convertBinaryDataToFile from "../constants/configs/Files/convert-binary-data-to-file";
import convertFileToBinaryData from "../constants/configs/Files/convert-file-to-binary-data";
import copyFile from "../constants/configs/Files/copy-files";
import deleteFiles from "../constants/configs/Files/delete-files";
import getFilePathPart from "../constants/configs/Files/get-file-path-part";
import getTemporaryFile from "../constants/configs/Files/get-temporary-file";
import ifFileExists from "../constants/configs/Files/if-file-exists";
import moveFiles from "../constants/configs/Files/move-files";
import readFromCSVFile from "../constants/configs/Files/read-from-csv-file";
import readTextFromFile from "../constants/configs/Files/read-text-from-file";
import waitForFile from "../constants/configs/Files/wait-for-file";
import writeFromCSVFile from "../constants/configs/Files/write-from-csv-file";
import writeTextFromFile from "../constants/configs/Files/write-text-from-file";
import comment from "../constants/configs/flow-control/comment";
import getLastError from "../constants/configs/flow-control/get-last-error";
import goTo from "../constants/configs/flow-control/go-to";
import label from "../constants/configs/flow-control/label";
import region from "../constants/configs/flow-control/region";
import runSubFlow from "../constants/configs/flow-control/run-subflow";
import stopFlow from "../constants/configs/flow-control/stop-flow";
import wait from "../constants/configs/flow-control/wait";
import copyFolder from "../constants/configs/Folder/copy-folder";
import createFolder from "../constants/configs/Folder/create-folder";
import deleteFolder from "../constants/configs/Folder/delete-folder";
import emptyFolder from "../constants/configs/Folder/empty-folder";
import getFilesInFolder from "../constants/configs/Folder/get-files-in-folder";
import getSpecialFolder from "../constants/configs/Folder/get-special-folder";
import getSubFoldersInFolder from "../constants/configs/Folder/get-sub-folder-in-folder";
import ifFolderExists from "../constants/configs/Folder/if-folder-exist";
import moveFolder from "../constants/configs/Folder/move-folder";
import renameFolder from "../constants/configs/Folder/rename-folder";
import changeWorkingDirectory from "../constants/configs/FTP/change-working-directory";
import closeConnection from "../constants/configs/FTP/close-connection";
import deleteFtpDirectory from "../constants/configs/FTP/delete-FTP-directory";
import deleteFtpFile from "../constants/configs/FTP/delete-FTP-file";
import downloadFilesFromFtp from "../constants/configs/FTP/download-file(s)-from-FTP";
import downloadFoldersFromFtp from "../constants/configs/FTP/download-folder(s)-from-FTP";
import invokeFtpCommand from "../constants/configs/FTP/invoke-FTP-command";
import listFtpDirectory from "../constants/configs/FTP/list-FTP-directory";
import openFtpConnection from "../constants/configs/FTP/open-FTP-connection";
import openSecureFtpConnection from "../constants/configs/FTP/open-secure-FTP-connection";
import renameFtpFile from "../constants/configs/FTP/rename-FTP-file";
import synchronizeDirectories from "../constants/configs/FTP/synchronizeDirectories";
import uploadFilesToFtp from "../constants/configs/FTP/upload-file(s)-to-FTP";
import uploadFoldersToFtp from "../constants/configs/FTP/upload-folder(s)-to-FTP";
import downloadFromWeb from "../constants/configs/http/download-from-web";
import invokeSOAPWebService from "../constants/configs/http/invoke-soap-web-service";
import invokeWebService from "../constants/configs/http/invoke-web-service";
import displayInputDialog from "../constants/configs/message-boxes/display-input-dialog";
import displayMessage from "../constants/configs/message-boxes/display-message";
import displaySelectFileDialog from "../constants/configs/message-boxes/display-select-file-dialog";
import displaySelectFolderDialog from "../constants/configs/message-boxes/display-select-folder-dialog";
import displaySelectFromListDialog from "../constants/configs/message-boxes/display-select-from-list-dialog";
import displaySelectDateDialog from "../constants/configs/message-boxes/display-selected-date-dialog";
import blockInput from "../constants/configs/mouse-and-keyboard/block-input";
import getKeyboardIdentifier from "../constants/configs/mouse-and-keyboard/get-keyboard-identifier";
import getMousePosition from "../constants/configs/mouse-and-keyboard/get-mouse-position";
import moveMouse from "../constants/configs/mouse-and-keyboard/move-mouse";
import moveMouseToImage from "../constants/configs/mouse-and-keyboard/move-mouse-to-image";
import moveMouseToTextOnScreenOcr from "../constants/configs/mouse-and-keyboard/move-mouse-to-text-on-screen-ocr";
import pressReleaseKey from "../constants/configs/mouse-and-keyboard/press-release-key";
import sendKeys from "../constants/configs/mouse-and-keyboard/send-keys";
import sendMouseClick from "../constants/configs/mouse-and-keyboard/send-mouse-click";
import setKeyState from "../constants/configs/mouse-and-keyboard/set-key-state";
import waitForMouse from "../constants/configs/mouse-and-keyboard/wait-for-mouse";
import waitForShortcutKey from "../constants/configs/mouse-and-keyboard/wait-for-shortcut-key";
import extractTextWithOcr from "../constants/configs/ocr/extract-text-with";
import waitForTextOnScreen from "../constants/configs/ocr/wait-for-text-on-screen";
import closeOutLook from "../constants/configs/outlook/close-outlook";
import launchOutlook from "../constants/configs/outlook/launch-outlook";
import processEmailMessagesInOutlook from "../constants/configs/outlook/process-email-messages-in-outlook";
import respondToOutlookMailMessage from "../constants/configs/outlook/respond-to-outlook-message";
import retrieveEmailMessagesFromOutlook from "../constants/configs/outlook/retrieve-email-messages-from-outlook";
import saveOutlookEmailMessages from "../constants/configs/outlook/save-outlook-email-messages";
import sendEmailMessageThroughOutlook from "../constants/configs/outlook/send-email-message-through-outlook";
import extractImagesFromPdf from "../constants/configs/PDF/extract-images-from-pdf";
import extractPdfFilePagesToNewPdfFile from "../constants/configs/PDF/extract-pdf-file-pages-to-new-pdf-file";
import extractTablesFromPdf from "../constants/configs/PDF/extract-tables-from-pdf";
import extractTextFromPdf from "../constants/configs/PDF/extract-text-from-pdf";
import mergePdfFiles from "../constants/configs/PDF/merge-pdf-files";
import runDOSCommand from "../constants/configs/Scripting/run-dos-command";
import runDotNetScript from "../constants/configs/Scripting/run-dotnet-script";
import runJavaScript from "../constants/configs/Scripting/run-javascript";
import runPowerShellScript from "../constants/configs/Scripting/run-powershell-script";
import runPythonScript from "../constants/configs/Scripting/run-python-script";
import runVBScript from "../constants/configs/Scripting/run-vbscript";
import deleteWindowsEnvironmentVariable from "../constants/configs/System/del-win-env-var";
import getWindowsEnvironmentVariable from "../constants/configs/System/get-win-env-var";
import ifProcess from "../constants/configs/System/if-process";
import ping from "../constants/configs/System/ping";
import runApplication from "../constants/configs/System/run-application";
import setWindowsEnvironmentVariable from "../constants/configs/System/set-win-env-var";
import terminateProcess from "../constants/configs/System/terminate-process";
import closeTerminalSession from "../constants/configs/terminal-emulation/close-terminal-session";
import getTextFromTerminalSession from "../constants/configs/terminal-emulation/get-text-from-terminal-session";
import moveCursorOnTerminalSession from "../constants/configs/terminal-emulation/move-cursor-on-terminal-session";
import openTerminalSession from "../constants/configs/terminal-emulation/open-terminal-session";
import searchForTextOnTerminalSession from "../constants/configs/terminal-emulation/search-for-text-on-terminal-session";
import sendKeyToTerminalSession from "../constants/configs/terminal-emulation/send-key-to-terminal-session";
import setTextOnTerminalSession from "../constants/configs/terminal-emulation/set-text-on-terminal-session";
import waitForTextOnTerminalSession from "../constants/configs/terminal-emulation/wait-for-text-on-terminal-session";
import appendLineToText from "../constants/configs/text/append-line-to-text";
import changeTextCase from "../constants/configs/text/change-text-case";
import convertNumberToText from "../constants/configs/text/convert-number-to-text";
import convertTextToDatetime from "../constants/configs/text/convert-text-to-datetime";
import ConvertTextToNumber from "../constants/configs/text/convert-text-to-number";
import createHtmlContent from "../constants/configs/text/create-html-content";
import createRandomText from "../constants/configs/text/create-random-text";
import cropText from "../constants/configs/text/crop-text";
import escapeTextForRegularExpression from "../constants/configs/text/escape-text-for-regular-expression";
import getSubtext from "../constants/configs/text/get-subtext";
import joinText from "../constants/configs/text/join-text";
import padText from "../constants/configs/text/pad-text";
import parseText from "../constants/configs/text/parse-text";
import recognizeEntitiesInText from "../constants/configs/text/recognize-entities-in-text";
import replaceText from "../constants/configs/text/replace-text";
import reverseText from "../constants/configs/text/reverse-text";
import splitText from "../constants/configs/text/split-text";
import trimText from "../constants/configs/text/trim-text";
import clickUiELementInWindow from "../constants/configs/ui-automation/click-ui-element-in-window";
import extractDataFromTable from "../constants/configs/ui-automation/data-extraction/extract-data-from-table";
import extractDataFromWindow from "../constants/configs/ui-automation/data-extraction/extract-data-from-window";
import getDetailsOfWindow from "../constants/configs/ui-automation/data-extraction/get-details-of-window";
import getDetailsOfAUiElementInWindow from "../constants/configs/ui-automation/data-extraction/get-of-ui-element-in-window";
import getSelectedCheckboxesInWindow from "../constants/configs/ui-automation/data-extraction/get-selected-checkboxes-in-window";
import getSelectedRadioButtonInWindow from "../constants/configs/ui-automation/data-extraction/get-selected-radio-button-in-window";
import takeScreenshotOfUiElement from "../constants/configs/ui-automation/data-extraction/take-screenshot-of-ui-element";
import dragDropUiELementInWindow from "../constants/configs/ui-automation/drag-drop-ui-element-in-window";
import expandCollapseTreeNodeInWindow from "../constants/configs/ui-automation/expand-collapse-tree-node";
import focusTextFieldInWindow from "../constants/configs/ui-automation/form-filling/focus-text-field-in-Window";
import populateTextFieldInWindow from "../constants/configs/ui-automation/form-filling/populate-text-field-in-window";
import pressButtonInWindow from "../constants/configs/ui-automation/form-filling/press-button-in-window";
import selectRadioButtonInWindow from "../constants/configs/ui-automation/form-filling/select-radio-button-in-window";
import setCheckboxStateInWindow from "../constants/configs/ui-automation/form-filling/set-checkbox-state-in-window";
import setDropdownListValueInWindow from "../constants/configs/ui-automation/form-filling/set-drop-down-list-value-in-window";
import hoverMouseOverUiElementInWindow from "../constants/configs/ui-automation/hover-mouse-over-ui-element";
import ifWindow from "../constants/configs/ui-automation/if-window";
import ifWindowContains from "../constants/configs/ui-automation/if-window-contains";
import selectMenuOptionInWindow from "../constants/configs/ui-automation/select-menu-option-in-window";
import selectTabInWindow from "../constants/configs/ui-automation/select-tab-in-window";
import useDesktop from "../constants/configs/ui-automation/use-desktop";
import waitForWindow from "../constants/configs/ui-automation/wait-for-window";
import waitForWindowContent from "../constants/configs/ui-automation/wait-for-window-content";
import closeWindow from "../constants/configs/ui-automation/windows/close-window";
import focusWindow from "../constants/configs/ui-automation/windows/focus-window";
import getWindow from "../constants/configs/ui-automation/windows/get-window";
import moveWindow from "../constants/configs/ui-automation/windows/move-window";
import resizeWindow from "../constants/configs/ui-automation/windows/resize-window";
import setWindowState from "../constants/configs/ui-automation/windows/set-window-state";
import setWindowVisibility from "../constants/configs/ui-automation/windows/set-window-visibility";
import addItemToList from "../constants/configs/variables/add-item-to-list";
import clearList from "../constants/configs/variables/clear-list";
import convertCustomObjectToJson from "../constants/configs/variables/convert-custom-object-to-json";
import convertJSONToCustomObject from "../constants/configs/variables/convert-json-to-custom-object";
import createNewList from "../constants/configs/variables/create-new-list";
import clearDataTable from "../constants/configs/variables/data-table/clear-data-table";
import convertDataTableToText from "../constants/configs/variables/data-table/convert-data-table-to-text";
import deleteColumnFromDataTable from "../constants/configs/variables/data-table/delete-column-from-data-table";
import deleteDuplicateRowsFromDataTable from "../constants/configs/variables/data-table/delete-duplicate-rows-from-data-table";
import deleteEmptyRowsFromDataTable from "../constants/configs/variables/data-table/delete-empty-rows-from-data-table";
import deleteRowFromDataTable from "../constants/configs/variables/data-table/delete-row-from-data-table";
import findOrReplaceInDataTable from "../constants/configs/variables/data-table/find-or-replace-in-data-table";
import insertColumnIntoDataTable from "../constants/configs/variables/data-table/insert-column-into-data-table";
import insertRowIntoDataTable from "../constants/configs/variables/data-table/insert-row-into-data-table";
import mergeDataTables from "../constants/configs/variables/data-table/merge-data-table";
import readFromCsvTextVariable from "../constants/configs/variables/data-table/read-from-csv-text-variable";
import sortDataTable from "../constants/configs/variables/data-table/sort-data-table";
import updateDataTableItem from "../constants/configs/variables/data-table/update-data-table-item";
import decreaseVariable from "../constants/configs/variables/decrease-variable";
import findCommonListItems from "../constants/configs/variables/find-common-list-items";
import generateRandomNumber from "../constants/configs/variables/generate-random-number";
import increaseVariable from "../constants/configs/variables/increase-variable";
import mergeLists from "../constants/configs/variables/merge-list";
import removeItemFromList from "../constants/configs/variables/remove-items-from-list";
import removeDuplicateItemsFromList from "../constants/configs/variables/reomve-duplicate-items-from-list";
import retrieveDataTableColumnIntoList from "../constants/configs/variables/retrieve-data-table-column-into-list";
import reverseList from "../constants/configs/variables/reverse-list";
import setVariable from "../constants/configs/variables/set-variable";
import shuffleList from "../constants/configs/variables/shuffle-list";
import sortList from "../constants/configs/variables/sort-list";
import subtractLists from "../constants/configs/variables/subtract-lists";
import truncateNumber from "../constants/configs/variables/truncate-number";
import ifService from "../constants/configs/windows-services/if-service";
import pauseService from "../constants/configs/windows-services/pause-service";
import resumeService from "../constants/configs/windows-services/resume-service";
import startService from "../constants/configs/windows-services/start-service";
import stopService from "../constants/configs/windows-services/stop-service";
import waitForService from "../constants/configs/windows-services/wait-for-service";
import attachToRunningWord from "../constants/configs/Word/attach-to-running-word";
import closeWord from "../constants/configs/Word/close-word";
import findAndReplaceWordsInWordDocument from "../constants/configs/Word/find-and-replace-words-in-word-document";
import insertImageInWordDocument from "../constants/configs/Word/insert-an-image-to-a-word-file";
import launchWord from "../constants/configs/Word/launch-word";
import readFromWordDocument from "../constants/configs/Word/read-from-word-document";
import saveWord from "../constants/configs/Word/save-word";
import writeToWordDocument from "../constants/configs/Word/write-to-word-document";
import controlScreensaver from "../constants/configs/WorkStation/control-screen-saver";
import getDefaultPrinter from "../constants/configs/WorkStation/get-default-printer";
import getScreenResolution from "../constants/configs/WorkStation/get-screen-resolution";
import logOffUser from "../constants/configs/WorkStation/log-off-user";
import playSound from "../constants/configs/WorkStation/play-sound";
import printDocument from "../constants/configs/WorkStation/print-document";
import showDesktop from "../constants/configs/WorkStation/show-desktop";
import takeScreenshot from "../constants/configs/WorkStation/take-screenshot";
import executexPathExpression from "../constants/configs/XML/execute-xPath-expression";
import getXmlElementAttribute from "../constants/configs/XML/get-xml-element-attribute";
import getXMLElementValue from "../constants/configs/XML/get-xml-element-value";
import insertXMLElement from "../constants/configs/XML/insert-xml-element";
import readXmlFromFile from "../constants/configs/XML/read-xml-from-file";
import removeXmlElement from "../constants/configs/XML/remove-xml-element";
import removeXMLElementAttribute from "../constants/configs/XML/remove-xml-element-attribute";
import setXmlElementAttribute from "../constants/configs/XML/set-xml-element-attribute";
import setXMLElementValue from "../constants/configs/XML/set-xml-element-value";
import writeXmlToFile from "../constants/configs/XML/write-xml-to-file";
import { ActivityConfig } from "../types/dynamic-form-types";

const dynamicActionMapper: { [key: string]: ActivityConfig } = {
  //Variables
  // createNewDataTable,
  insertRowIntoDataTable,
  deleteRowFromDataTable,
  updateDataTableItem,
  findOrReplaceInDataTable,
  insertColumnIntoDataTable,
  deleteColumnFromDataTable,
  deleteEmptyRowsFromDataTable,
  deleteDuplicateRowsFromDataTable,
  clearDataTable,
  sortDataTable,
  // filterDataTable,
  mergeDataTables,
  // joinDataTables,
  readFromCsvTextVariable,
  convertDataTableToText,
  truncateNumber,
  generateRandomNumber,
  clearList,
  removeItemFromList,
  sortList,
  shuffleList,
  mergeLists,
  reverseList,
  removeDuplicateItemsFromList,
  findCommonListItems,
  subtractLists,
  retrieveDataTableColumnIntoList,
  convertJSONToCustomObject,
  convertCustomObjectToJson,
  addItemToList,
  createNewList,
  increaseVariable,
  decreaseVariable,
  // runPowerFxExpression,
  setVariable,

  //Conditional
  conditionalCase,
  elseIfCondition,
  ifCondition,
  switchCase,

  //Flow control
  comment,
  getLastError,
  goTo,
  label,
  region,
  runSubFlow,
  stopFlow,
  wait,

  //Folder
  ifFolderExists,
  getFilesInFolder,
  getSubFoldersInFolder,
  createFolder,
  deleteFolder,
  emptyFolder,
  copyFolder,
  moveFolder,
  renameFolder,
  getSpecialFolder,

  //File
  ifFileExists,
  waitForFile,
  copyFile,
  moveFiles,
  deleteFiles,
  readTextFromFile,
  writeTextFromFile,
  readFromCSVFile,
  writeFromCSVFile,
  getFilePathPart,
  getTemporaryFile,
  convertBase64ToText,
  convertFileToBinaryData,
  convertBinaryDataToFile,

  //System
  ifProcess,
  runApplication,
  terminateProcess,
  ping,
  setWindowsEnvironmentVariable,
  getWindowsEnvironmentVariable,
  deleteWindowsEnvironmentVariable,

  //Workstation
  printDocument,
  getDefaultPrinter,
  showDesktop,
  // lockWorkstation,
  playSound,
  // emptyRecycleBin,
  takeScreenshot,
  controlScreensaver,
  getScreenResolution,
  logOffUser,

  //Scripting
  runDOSCommand,
  runVBScript,
  runJavaScript,
  runPowerShellScript,
  runPythonScript,
  runDotNetScript,

  //Word
  launchWord,
  attachToRunningWord,
  saveWord,
  closeWord,
  readFromWordDocument,
  writeToWordDocument,
  insertImageInWordDocument,
  findAndReplaceWordsInWordDocument,

  //Excel
  resizeColumnsRows,
  runExcelMacro,
  getActiveExcelWorksheet,
  getAllExcelWorksheets,
  deleteExcelWorksheet,
  renameExcelWorksheet,
  copyExcelWorksheet,
  activateCellInExcelWorksheet,
  selectCellsInExcelWorksheet,
  getSelectedCellRangeFromExcelWorksheet,
  copyCellsFromExcelWorksheet,
  pasteCellsToExcelWorksheet,
  deleteFromExcelWorksheet,
  insertRowToExcelWorksheet,
  deleteRowFromExcelWorksheet,
  insertColumnToExcelWorksheet,
  deleteColumnFromExcelWorksheet,
  findsAndReplaceCellsInExcelWorksheet,
  getFirstFreeRowOnColumnFromExcelWorksheet,
  readFormulaFromExcel,
  getTableRangeFromExcelWorksheet,
  autoFillCellsInExcelWorksheet,
  appendCellsInExcelWorksheet,
  lookupRangeInExcelWorksheet,
  setColorOfCellsInExcelWorksheet,
  launchExcel,
  attachToRunningExcel,
  readFromExcelWorksheet,
  getActiveCellOnExcelWorksheet,
  saveExcel,
  writeToExcelWorksheet,
  closeExcel,
  setActiveExcelWorksheet,
  addNewWorksheet,
  getFirstFreeColumnRowFromExcelWorksheet,
  getColumnNameOnExcelWorksheet,
  clearCellsInExcelWorksheet,
  filterCellsInExcelWorksheet,

  //Compression
  zipFiles,
  unzipFiles,

  //UI Automation
  getDetailsOfWindow,
  getDetailsOfAUiElementInWindow,
  getSelectedCheckboxesInWindow,
  getSelectedRadioButtonInWindow,
  extractDataFromWindow,
  extractDataFromTable,
  takeScreenshotOfUiElement,
  focusTextFieldInWindow,
  populateTextFieldInWindow,
  pressButtonInWindow,
  selectRadioButtonInWindow,
  setCheckboxStateInWindow,
  setDropdownListValueInWindow,
  getWindow,
  focusWindow,
  setWindowState,
  setWindowVisibility,
  moveWindow,
  resizeWindow,
  closeWindow,
  ifWindowContains,
  waitForWindowContent,
  // ifImage,
  useDesktop,
  selectTabInWindow,
  // waitForImage,
  hoverMouseOverUiElementInWindow,
  clickUiELementInWindow,
  selectMenuOptionInWindow,
  dragDropUiELementInWindow,
  expandCollapseTreeNodeInWindow,
  ifWindow,
  waitForWindow,

  //HTTP
  downloadFromWeb,
  invokeSOAPWebService,
  invokeWebService,

  //Browser automation
  extractDataFromWebPage,
  getDetailsOfWebPage,
  getDetailsOfElementOnWebPage,
  takeScreenshotOfWebPage,
  focusTextFieldOnWebPage,
  populateTextFieldOnWebPage,
  setCheckboxStateOnWebPage,
  selectRadioButtonOnWebPage,
  setDropDownListValueOnWebPage,
  pressButtonOnWebPage,
  ifWebPageContains,
  waitForWebPageContent,
  launchNewInternetExplorer,
  launchNewFirefox,
  launchNewChrome,
  launchNewIMicrosoftEdge,
  createNewTab,
  goToWebPage,
  clickLinkOnWebPage,
  clickDownloadLinkOnWebPage,
  runJavascriptFunctionOnWebPage,
  hoverMouseOverElementOnWebPage,
  closeWebBrowser,

  //Database
  openSQLConnection,
  executeSQLStatement,
  closeSQLConnection,

  //Email
  retrieveEmailMessages,
  processEmailMessages,
  sendEmail,

  //Exchange Server
  connectToExchangeServer,
  retrieveExchangeEmailMessages,
  sendExchangeEmailMessage,
  processExchangeEmailMessages,

  //Outlook
  launchOutlook,
  retrieveEmailMessagesFromOutlook,
  sendEmailMessageThroughOutlook,
  processEmailMessagesInOutlook,
  saveOutlookEmailMessages,
  respondToOutlookMailMessage,
  closeOutLook,

  //Message boxes
  displayMessage,
  displayInputDialog,
  displaySelectDateDialog,
  displaySelectFromListDialog,
  displaySelectFileDialog,
  displaySelectFolderDialog,
  // displayCustomForm,

  //Mouse and keyboard
  blockInput,
  getMousePosition,
  moveMouse,
  moveMouseToImage,
  moveMouseToTextOnScreenOcr,
  sendMouseClick,
  sendKeys,
  pressReleaseKey,
  setKeyState,
  waitForMouse,
  getKeyboardIdentifier,
  waitForShortcutKey,

  //Clipboard
  getClipboardText,
  setClipboardText,
  // clearClipboardContents,

  //Text
  // useTheRecognizeEntitiesInTextAction,
  appendLineToText,
  getSubtext,
  cropText,
  padText,
  trimText,
  reverseText,
  changeTextCase,
  ConvertTextToNumber,
  convertNumberToText,
  convertTextToDatetime,
  // convertDatetimeToText,
  createRandomText,
  joinText,
  splitText,
  parseText,
  replaceText,
  escapeTextForRegularExpression,
  recognizeEntitiesInText,
  createHtmlContent,

  //Date time
  addToDateTime,
  subtractDates,
  getCurrentDateAndTime,

  //PDF
  extractTextFromPdf,
  extractTablesFromPdf,
  extractImagesFromPdf,
  extractPdfFilePagesToNewPdfFile,
  mergePdfFiles,

  //CMD Session
  openCmdSession,
  readFromCmdSession,
  writeToCmdSession,
  waitForTextOnCmdSession,
  closeCmdSession,

  //Terminal emulation
  openTerminalSession,
  closeTerminalSession,
  moveCursorOnTerminalSession,
  getTextFromTerminalSession,
  setTextOnTerminalSession,
  sendKeyToTerminalSession,
  waitForTextOnTerminalSession,
  searchForTextOnTerminalSession,

  //OCR
  // useTheWindowsOcrEngine,
  waitForTextOnScreen,
  extractTextWithOcr,

  //Cryptography
  encryptTextWithAes,
  decryptTextWithAes,
  encryptFromFileWithAes,
  decryptToFileWithAes,
  hashText,
  hashFromFile,
  hashTextWithKey,
  hashFromFileWithKey,

  //Windows Service
  ifService,
  waitForService,
  startService,
  stopService,
  pauseService,
  resumeService,

  //XML
  readXmlFromFile,
  writeXmlToFile,
  executexPathExpression,
  getXmlElementAttribute,
  setXmlElementAttribute,
  removeXMLElementAttribute,
  getXMLElementValue,
  setXMLElementValue,
  insertXMLElement,
  removeXmlElement,

  //FTP
  openFtpConnection,
  listFtpDirectory,
  openSecureFtpConnection,
  closeConnection,
  changeWorkingDirectory,
  downloadFilesFromFtp,
  downloadFoldersFromFtp,
  uploadFilesToFtp,
  uploadFoldersToFtp,
  deleteFtpFile,
  renameFtpFile,
  // createFtpDirectory,
  deleteFtpDirectory,
  invokeFtpCommand,
  synchronizeDirectories,
};

export { dynamicActionMapper };
