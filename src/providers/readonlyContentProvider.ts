import { TextDocumentContentProvider, Uri, CancellationToken, ProviderResult, workspace, Disposable } from 'vscode';
import { READONLY_SCHEME } from '../utils/consts';

class ReadonlyContentProvider implements TextDocumentContentProvider {
  private contents = new Map<string, string>();
  private disposable: Disposable;

  constructor(private readonly scheme: string) {
    this.disposable = workspace.registerTextDocumentContentProvider(scheme, this);
  }

  provideTextDocumentContent(uri: Uri, token: CancellationToken): ProviderResult<string> {
    return this.contents.get(uri.toString());
  }

  createReadonlyUris(fileName1: string, content1: string, fileName2: string, content2: string): [Uri, Uri] {
    this.clear();

    const timestamp = Date.now();

    const uri1 = Uri.parse(`${this.scheme}://${timestamp}-1/${fileName1}`);
    const uri2 = Uri.parse(`${this.scheme}://${timestamp}-2/${fileName2}`);

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

export class ReadonlyContentProviderSingleton {
  private static instance: ReadonlyContentProvider | null = null;

  static getInstance(): ReadonlyContentProvider {
    if (!ReadonlyContentProviderSingleton.instance) {
      ReadonlyContentProviderSingleton.instance = new ReadonlyContentProvider(READONLY_SCHEME);
    }
    return ReadonlyContentProviderSingleton.instance;
  }
}
