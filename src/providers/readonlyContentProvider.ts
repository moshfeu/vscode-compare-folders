import { TextDocumentContentProvider, Uri, CancellationToken, ProviderResult, workspace, Disposable } from 'vscode';

export class ReadonlyContentProvider implements TextDocumentContentProvider {
  private contents = new Map<string, string>();
  private disposable: Disposable;

  constructor(private readonly scheme: string) {
    this.disposable = workspace.registerTextDocumentContentProvider(scheme, this);
  }

  provideTextDocumentContent(uri: Uri, token: CancellationToken): ProviderResult<string> {
    return this.contents.get(uri.toString());
  }

  createReadonlyUris(content1: string, content2: string, fileName1: string, fileName2: string): [Uri, Uri] {
    // Clear old content before creating new URIs to prevent memory leaks
    this.clear();
    
    const timestamp = Date.now();
    
    const uri1 = Uri.parse(`${this.scheme}:${fileName1}?${timestamp}-1`);
    const uri2 = Uri.parse(`${this.scheme}:${fileName2}?${timestamp}-2`);
    
    this.setContent(uri1, content1);
    this.setContent(uri2, content2);

    return [uri1, uri2];
  }

  private setContent(uri: Uri, content: string): void {
    this.contents.set(uri.toString(), content);
  }

  clear(): void {
    this.contents.clear();
  }

  dispose(): void {
    this.disposable.dispose();
    this.clear();
  }
}
