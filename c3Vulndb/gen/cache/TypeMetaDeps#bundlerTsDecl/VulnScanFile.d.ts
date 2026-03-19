export interface VulnScanFile {

  readonly id: string;
  withId(id: string): VulnScanFile;

  readonly versionEdits?: C3.Array<VersionEdit | null>;
  withVersionEdits(versionEdits: C3.Array<VersionEdit | null> | Array<IVersionEdit | null>): VulnScanFile;

  readonly name?: string | null;
  withName(name: string | null): VulnScanFile;

  readonly meta?: Meta | null;
  withMeta(meta: IMeta | null): VulnScanFile;

  readonly version?: number | null;
  withVersion(version: number | null): VulnScanFile;

  readonly typeWithBindings?: Type | null;
  withTypeWithBindings(typeWithBindings: IType | null): VulnScanFile;

  readonly fileName: string;
  withFileName(fileName: string): VulnScanFile;

  readonly release?: string | null;
  withRelease(release: string | null): VulnScanFile;

  readonly scanType?: string | null;
  withScanType(scanType: string | null): VulnScanFile;

  readonly scanDate?: DateTime | null;
  withScanDate(scanDate: DateTime | Date | string | null): VulnScanFile;

  readonly vulnCount?: number | null;
  withVulnCount(vulnCount: number | null): VulnScanFile;
}

