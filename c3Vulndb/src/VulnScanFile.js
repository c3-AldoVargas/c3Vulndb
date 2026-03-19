/**
 * Fetch all VulnScanFile records ordered by scanDate descending.
 *
 * @return {[VulnScanFile]} Array of VulnScanFile objects sorted by scanDate.
 */
function getAvailableFiles() {
  var files = VulnScanFile.fetch({
    limit: -1,
    include: "this",
    order: "descending(scanDate)"
  });

  return files.objs;
}

/**
 * Parses a vulnerability knowledgebase file name to extract scan type and release.
 *
 * Supported formats:
 *   new_8.9.1_66_cve_knowledgebase.json        -> { scanType: "new",      release: "8.9.1_66" }
 *   existing8.9.0-rc+189_cve_knowledgebase.json -> { scanType: "existing", release: "8.9.0-rc+189" }
 *   new8.9.0-rc+189_hc_cve_knowledgebase.json   -> { scanType: "new_hc",  release: "8.9.0-rc+189" }
 *   new8.9.0-rc+411_cve_knowledgebase.json       -> { scanType: "new",     release: "8.9.0-rc+411" }
 *
 * @param {string} fileName
 * @return {{ scanType: string, release: string }}
 */
function parseFileName(fileName) {
  var baseName = fileName.replace(/\.json$/i, "");

  // Remove the trailing _cve_knowledgebase or _hc_cve_knowledgebase suffix
  var hasHc = baseName.indexOf("_hc_cve_knowledgebase") !== -1;
  baseName = baseName.replace(/_hc_cve_knowledgebase$/, "").replace(/_cve_knowledgebase$/, "");

  // Extract the scan type prefix: "new_", "new", "existing", etc.
  var scanType = "unknown";
  var release = baseName;

  var prefixes = ["existing", "new"];
  for (var i = 0; i < prefixes.length; i++) {
    var prefix = prefixes[i];
    if (baseName.indexOf(prefix) === 0) {
      scanType = prefix;
      release = baseName.substring(prefix.length);
      // Remove leading underscore if present (e.g., new_8.9.1_66 -> _8.9.1_66)
      if (release.charAt(0) === "_") {
        release = release.substring(1);
      }
      break;
    }
  }

  if (hasHc) {
    scanType = scanType + "_hc";
  }

  return {
    scanType: scanType,
    release: release
  };
}

/**
 * Loads a JSON vulnerability knowledgebase file into the system.
 * Parses the file name for release and scan type, creates the VulnScanFile record,
 * and creates Vulnerability records for each entry. Deduplicates by vulnId within the file.
 *
 * @param {string} fileName The original file name.
 * @param {Array} jsonData The parsed JSON array of vulnerability entries.
 * @return {VulnScanFile} The created/updated scan file record.
 */
function loadJsonData(fileName, jsonData) {
  // Parse file name for metadata
  var parsed = parseFileName(fileName);

  // Create a deterministic ID from the file name (replace special chars)
  var fileId = "scan_" + fileName
    .replace(/\.json$/i, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_+/g, "_");

  // Check if this scan file already exists — if so, remove old vulns first
  var existing = VulnScanFile.exists({ filter: Filter.eq("id", fileId) });
  if (existing) {
    // Remove old vulnerability records for this file to allow re-upload
    Vulnerability.removeAll(
      { filter: Filter.eq("scanFile", fileId) },
      true
    );
  }

  // Deduplicate entries by Vuln ID within this file
  var seenVulnIds = {};
  var uniqueEntries = [];
  for (var i = 0; i < jsonData.length; i++) {
    var entry = jsonData[i];
    var vulnId = entry["Vuln ID"] || entry["vulnId"] || "";
    if (vulnId && !seenVulnIds[vulnId]) {
      seenVulnIds[vulnId] = true;
      uniqueEntries.push(entry);
    }
  }

  // Create / update the VulnScanFile record
  var scanFile = VulnScanFile.make({
    id: fileId,
    fileName: fileName,
    release: parsed.release,
    scanType: parsed.scanType,
    scanDate: DateTime.now(),
    vulnCount: uniqueEntries.length
  }).upsert();

  // Build Vulnerability objects in batches
  var batchSize = 500;
  var batch = [];

  for (var j = 0; j < uniqueEntries.length; j++) {
    var e = uniqueEntries[j];
    var vid = e["Vuln ID"] || e["vulnId"] || ("unknown_" + j);

    // Create a deterministic vulnerability ID
    var vulnRecordId = fileId + "_" + vid.replace(/[^a-zA-Z0-9\-]/g, "_");

    var vuln = Vulnerability.make({
      id: vulnRecordId,
      vulnId: vid,
      path: e["Path"] || e["path"] || "",
      trigger: e["Trigger"] || e["trigger"] || "",
      message: e["Message"] || e["message"] || "",
      repository: e["Repository"] || e["repository"] || "",
      tag: e["Tag"] || e["tag"] || "",
      image: e["Image"] || e["image"] || "",
      messageSeverity: e["Message Severity"] || e["messageSeverity"] || "",
      hasFix: e["Has Fix"] || e["hasFix"] || "",
      externalCvssVector: e["External CVSS vectorstring"] || e["externalCvssVector"] || "",
      classifications: e["Classification(s)/Label(s)"] || e["classifications"] || "",
      c3AiCvss4Vector: e["C3 AI CVSS4 vectorstring"] || e["c3AiCvss4Vector"] || "",
      c3AiSeverityRating: e["C3 AI Severity Rating"] || e["c3AiSeverityRating"] || "",
      c3AiResponse: e["C3 AI Response"] || e["c3AiResponse"] || "",
      vulnComments: e["Vuln Comments"] || e["vulnComments"] || "",
      scanFile: { id: fileId }
    });

    batch.push(vuln);

    if (batch.length >= batchSize) {
      Vulnerability.mergeBatch(batch);
      batch = [];
    }
  }

  // Merge remaining batch
  if (batch.length > 0) {
    Vulnerability.mergeBatch(batch);
  }

  return VulnScanFile.forId(fileId).get("this");
}

/**
 * Deletes a scan file and all its associated vulnerability records.
 *
 * @param {string} scanFileId The ID of the scan file to delete.
 * @return {boolean} True if the deletion was successful.
 */
function deleteScanFile(scanFileId) {
  // Remove all vulnerability records associated with this scan file
  Vulnerability.removeAll(
    { filter: Filter.eq("scanFile", scanFileId) },
    true
  );

  // Remove the scan file record itself
  VulnScanFile.forId(scanFileId).remove();

  return true;
}
