/**
 * Persist non-matched CVEs from a customer scan report for internal triage.
 * Rows arrive from the frontend as ValidationNonMatchResult objects with
 * customer-prefixed field names (customerImage, customerTag, etc.).
 *
 * @param {[json]} rows - Array of ValidationNonMatchResult objects.
 * @returns {[CustomerScanResult]} Array of created CustomerScanResult records.
 */
function saveUnmatched(rows) {
  if (!rows || rows.length === 0) {
    return [];
  }

  var now = DateTime.now();
  var records = [];

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var vulnId = row.vulnId || "";
    if (!vulnId) {
      continue;
    }

    records.push(CustomerScanResult.make({
      id: "csr_" + vulnId.replace(/[^a-zA-Z0-9-]/g, "_") + "_" + now.toMillis(),
      vulnId: vulnId,
      image: row.customerImage || "",
      tag: row.customerTag || "",
      repository: row.customerRepository || "",
      messageSeverity: row.customerSeverity || "",
      scanDate: now,
      status: "Pending"
    }));
  }

  if (records.length > 0) {
    CustomerScanResult.mergeBatch(records);
  }

  return records;
}
