/**
 * Converts a browser File or Blob into a Data URL string.
 * e.g. "data:audio/wav;base64,UklGRi..."
 *
 * The full data URL string is passed directly in the request payload.
 */
export function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Converts multiple Files to Data URL strings in parallel. */
export function filesToDataUrls(files: File[]): Promise<string[]> {
  return Promise.all(files.map(fileToDataUrl));
}
