// ============================================================
// Google Apps Script — Contract PDF Upload to Google Drive
// ============================================================
// SETUP INSTRUCTIONS:
// 1. Go to https://script.google.com
// 2. Click "New Project"
// 3. Delete the default code and paste this entire file
// 4. Click the project name at top-left, rename to "Contract PDF Upload"
// 5. Click "Deploy" > "New deployment"
// 6. Click the gear icon next to "Select type" > choose "Web app"
// 7. Set "Execute as" to "Me"
// 8. Set "Who has access" to "Anyone"
// 9. Click "Deploy" and authorize when prompted
// 10. Copy the Web App URL — give it to Dylan to put in the contracts
// ============================================================

// Set the folder name where PDFs will be saved
const FOLDER_NAME = 'Signed Contracts';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const fileName = data.fileName || 'Signed-Contract.pdf';
    const pdfBase64 = data.pdfData; // base64-encoded PDF

    // Decode the base64 PDF
    const pdfBlob = Utilities.newBlob(
      Utilities.base64Decode(pdfBase64),
      'application/pdf',
      fileName
    );

    // Get or create the "Signed Contracts" folder
    const folders = DriveApp.getFoldersByName(FOLDER_NAME);
    let folder;
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(FOLDER_NAME);
    }

    // Save the PDF to the folder
    const file = folder.createFile(pdfBlob);

    // Make the file viewable by anyone with the link
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileUrl = file.getUrl();
    const fileId = file.getId();

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        fileUrl: fileUrl,
        fileId: fileId,
        fileName: fileName
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function — run this in the editor to verify it works
function testSetup() {
  const folders = DriveApp.getFoldersByName(FOLDER_NAME);
  if (folders.hasNext()) {
    Logger.log('Folder "' + FOLDER_NAME + '" already exists');
  } else {
    DriveApp.createFolder(FOLDER_NAME);
    Logger.log('Created folder "' + FOLDER_NAME + '"');
  }
  Logger.log('Setup complete!');
}
