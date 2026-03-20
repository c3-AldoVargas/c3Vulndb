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
 * Initialises a VulnScanFile record for a new upload.
 * Parses the file name, creates/updates the scan-file record, and removes any
 * previously persisted vulnerabilities for that file so batches can be loaded fresh.
 *
 * @param {string} fileName  The original file name.
 * @param {int}    vulnCount Total number of vulnerability entries.
 * @return {VulnScanFile} The created/updated scan file record.
 */
function initScanFile(fileName, vulnCount) {
  var parsed = parseFileName(fileName);

  var fileId = "scan_" + fileName
    .replace(/\.json$/i, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_+/g, "_");

  // Remove old vulnerability records if re-uploading
  var existing = VulnScanFile.exists({ filter: Filter.eq("id", fileId) });
  if (existing) {
    Vulnerability.removeAll(
      { filter: Filter.eq("scanFile", fileId) },
      true
    );
  }

  VulnScanFile.make({
    id: fileId,
    fileName: fileName,
    release: parsed.release,
    scanType: parsed.scanType,
    scanDate: DateTime.now(),
    vulnCount: vulnCount
  }).upsert();

  return VulnScanFile.forId(fileId).get("this");
}

/**
 * Loads a batch of vulnerability entries for an already-initialised scan file.
 * Called repeatedly by the frontend with chunks of ~200 entries.
 *
 * @param {string} scanFileId The ID returned by initScanFile.
 * @param {Array}  entries    A chunk of the JSON vulnerability array.
 * @return {int} Number of vulnerability records persisted.
 */
function loadVulnBatch(scanFileId, entries) {
  if (!entries || entries.length === 0) {
    return 0;
  }

  var batch = [];

  for (var j = 0; j < entries.length; j++) {
    var e = entries[j];
    var vid = e["Vuln ID"] || e["vulnId"] || "";
    if (!vid) {
      continue;
    }

    // Use _rowIdx (original file row index) for a globally unique ID per row.
    // This allows the same CVE to appear multiple times (different containers).
    var rowIdx = (e["_rowIdx"] !== undefined && e["_rowIdx"] !== null) ? e["_rowIdx"] : j;
    var vulnRecordId = scanFileId + "_row_" + rowIdx;

    batch.push(Vulnerability.make({
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
      scanFile: { id: scanFileId }
    }));
  }

  if (batch.length > 0) {
    Vulnerability.mergeBatch(batch);
  }

  return batch.length;
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
