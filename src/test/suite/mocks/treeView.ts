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

type CheckboxChangeEvent<T> = TreeView<T> extends { onDidChangeCheckboxState: infer TEvent } ? TEvent : Event<unknown>;

export class MockTreeView implements TreeView<File> {
  description: string | undefined = undefined;
  message: string | undefined = undefined;
  title: string | undefined = undefined;
  badge: ViewBadge | undefined = undefined;
  readonly selection: readonly File[] = [];
  readonly visible = false;
  readonly onDidExpandElement: Event<TreeViewExpansionEvent<File>> = new EventEmitter<TreeViewExpansionEvent<File>>().event;
  readonly onDidCollapseElement: Event<TreeViewExpansionEvent<File>> = new EventEmitter<TreeViewExpansionEvent<File>>().event;
  readonly onDidChangeSelection: Event<TreeViewSelectionChangeEvent<File>> = new EventEmitter<TreeViewSelectionChangeEvent<File>>().event;
  readonly onDidChangeVisibility: Event<TreeViewVisibilityChangeEvent> = new EventEmitter<TreeViewVisibilityChangeEvent>().event;
  readonly onDidChangeCheckboxState: CheckboxChangeEvent<File> = new EventEmitter<unknown>().event as CheckboxChangeEvent<File>;

  reveal(): Thenable<void> {
    return Promise.resolve();
  }

  dispose(): void {}
}
