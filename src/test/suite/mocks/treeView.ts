import {
  EventEmitter,
  type Event,
  type TreeView,
  type TreeViewExpansionEvent,
  type TreeViewSelectionChangeEvent,
  type TreeViewVisibilityChangeEvent,
  type ViewBadge,
} from 'vscode';
import type { File } from '../../../models/file';

export class MockTreeView implements TreeView<File> {
  description: string | undefined = undefined;
  message: string | undefined = undefined;
  title: string | undefined = undefined;
  badge: ViewBadge | undefined = undefined;
  selection: readonly File[] = [];
  readonly visible = false;
  readonly selectionEmitter = new EventEmitter<TreeViewSelectionChangeEvent<File>>();
  readonly onDidExpandElement: Event<TreeViewExpansionEvent<File>> = new EventEmitter<TreeViewExpansionEvent<File>>().event;
  readonly onDidCollapseElement: Event<TreeViewExpansionEvent<File>> = new EventEmitter<TreeViewExpansionEvent<File>>().event;
  readonly onDidChangeSelection: Event<TreeViewSelectionChangeEvent<File>> = this.selectionEmitter.event;
  readonly onDidChangeVisibility: Event<TreeViewVisibilityChangeEvent> = new EventEmitter<TreeViewVisibilityChangeEvent>().event;

  fireSelectionChange(selectedItems: File[]): void {
    this.selection = selectedItems;
    this.selectionEmitter.fire({ selection: selectedItems });
  }

  reveal(): Thenable<void> {
    return Promise.resolve();
  }

  dispose(): void {}
}
