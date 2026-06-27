/**
 * Converts an array of objects to a CSV string and triggers a file download in the browser.
 * @param data Array of objects (each object represents a row)
 * @param filename Name of the file to download (without .csv extension)
 */
export function exportToCsv(data: Record<string, any>[], filename: string) {
  if (!data || !data.length) return;

  // Extract headers
  const headers = Object.keys(data[0]);

  // Build CSV content
  const csvContent = [
    // Header row
    headers.map(escapeCsvValue).join(","),
    // Data rows
    ...data.map((row) =>
      headers.map((fieldName) => escapeCsvValue(row[fieldName])).join(",")
    ),
  ].join("\n");

  // Create Blob and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Helper to escape values for CSV
function escapeCsvValue(val: any): string {
  if (val === null || val === undefined) {
    return "";
  }
  const str = String(val);
  // If the value contains quotes, commas, or newlines, it must be enclosed in quotes
  // and any internal quotes must be doubled.
  if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
