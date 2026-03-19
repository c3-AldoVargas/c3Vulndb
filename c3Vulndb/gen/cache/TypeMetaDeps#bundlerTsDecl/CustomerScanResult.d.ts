export interface CustomerScanResult {

  readonly id: string;
  withId(id: string): CustomerScanResult;

  readonly versionEdits?: C3.Array<VersionEdit | null>;
  withVersionEdits(versionEdits: C3.Array<VersionEdit | null> | Array<IVersionEdit | null>): CustomerScanResult;

  readonly name?: string | null;
  withName(name: string | null): CustomerScanResult;

  readonly meta?: Meta | null;
  withMeta(meta: IMeta | null): CustomerScanResult;

  readonly version?: number | null;
  withVersion(version: number | null): CustomerScanResult;

  readonly typeWithBindings?: Type | null;
  withTypeWithBindings(typeWithBindings: IType | null): CustomerScanResult;

  readonly vulnId: string;
  withVulnId(vulnId: string): CustomerScanResult;

  readonly image?: string | null;
  withImage(image: string | null): CustomerScanResult;

  readonly tag?: string | null;
  withTag(tag: string | null): CustomerScanResult;

  readonly repository?: string | null;
  withRepository(repository: string | null): CustomerScanResult;

  readonly messageSeverity?: string | null;
  withMessageSeverity(messageSeverity: string | null): CustomerScanResult;

  readonly scanDate?: DateTime | null;
  withScanDate(scanDate: DateTime | Date | string | null): CustomerScanResult;

  readonly status?: string | null;
  withStatus(status: string | null): CustomerScanResult;
}

