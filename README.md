[![Build Status](https://dev.azure.com/moshfeu-vscode/CompareFoldersExtension/_apis/build/status/moshfeu.vscode-compare-folders?branchName=master)](https://dev.azure.com/moshfeu-vscode/CompareFoldersExtension/_build/latest?definitionId=1&branchName=master)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-yellow.svg?style=flat)](https://github.com/Coding-Coach/find-a-mentor/issues)
[![The MIT License](https://flat.badgen.net/badge/license/MIT/orange)](http://opensource.org/licenses/MIT)
[![GitHub](https://flat.badgen.net/github/release/moshfeu/vscode-compare-folders)](https://github.com/moshfeu/vscode-compare-folders/releases)
[![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/installs-short/moshfeu.compare-folders.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=moshfeu.compare-folders)
[![Follow me on Twitter](https://img.shields.io/twitter/follow/moshfeu.svg?style=social)](https://twitter.com/moshfeu)

The extension allows you to compare folders, show the diffs in a list and present diff in a splitted view side by side.

![Screen record](https://user-images.githubusercontent.com/3723951/92312411-f1f3b600-efc8-11ea-93b8-e90a3e25e9cb.gif)

### Thanks

The extension uses the great [`dir-compare`](https://github.com/gliviu/dir-compare) package made by [Liviu Grigorescu](https://github.com/gliviu). If you like this extension, please give a star to `dir-compare`!

## Limitations

Currently seems like there might be issues [[#81](https://github.com/moshfeu/vscode-compare-folders/issues/81), [#83](https://github.com/moshfeu/vscode-compare-folders/issues/83)] with comparing local and remote folders over ssh.
Please take this under consideration.

## How to use?

There are several ways to choose folders to compare:

- Command Palette -
  - `Compare a folder against workspace` choose a folder to compare against the workspace's folder (when workspace is not empty)
  - `Choose 2 folders and compare` - opens OS folder chooser twice
- Compare Folders Panel (Click on the icon in the Activity Bar)
  - `Click to select a folder` see 1st item
  - `Click to select folders` see 2nd item
- File explorer
  - Select 2 folders, right click and click on `Compare selected folders` see 2nd item
- From history
  - `Pick from recent compares` chose one of the pairs you compared in the past.
  - (The list can be reset by `Clear recent compares`)

`Refresh` - If there are changes in the compared folders' files, click on the `refresh` button will re-compare the folders.

## Options (under vscode settings)

- `excludeFilter` - glob string
- `includeFilter` - glob string

***Example***

```json
"compareFolders.excludeFilter": [
  "**/node_modules",
  "**/.svn",
  "**/.git"
]
```
- `compareContent` - boolean - Compares files by content
- `diffViewTitle` - One of the options: "name only", "compared path", "full path"
- `ignoreFileNameCase` - boolean - Compare files with the same name but different case
- `diffLayout` - One of the options: "local <> compared" or "compared <> local"
- `showIdentical` - boolean - Whether or not show the identical files panel
- `useDiffMerge` - boolean - Whether or not using [`Diff & Merge`](https://marketplace.visualstudio.com/items?itemName=moshfeu.diff-merge) extension as the Diff viewer. In order to use this option, you should install the extension
- `folderLeft` + `folderRight` - strings - paths of 2 folders, compare them on the extension load.
- `ignoreExtension` - Set groups of extensions so while comparing, pairs of files considered the same file if both of the files extension are in the same group. **Note:** each extension can show **only once** it this list
- `ignoreLineEnding` - boolean - ignore crlf/lf line ending differences
- `ignoreWhiteSpaces` - boolean - ignore white spaces at the beginning and ending of a line (similar to `diff -b`)
- `ignoreAllWhiteSpaces` - boolean - ignore all white space differences (similar to `diff -w`)
- `ignoreEmptyLines` - boolean - ignore differences caused by empty lines (similar to `diff -B`)
- - `respectGitIgnore` - boolean - exclude files that are in .gitignore

***Example***
```json
"compareFolders.ignoreExtension": [
  ["php", "cs"]
]
```

## CLI

By calling the following command from the terminal / command line, the extension will be calling on vscode load and show the differences view

```shell
COMPARE_FOLDERS=DIFF code path/to/folder1 path/to/folder2
```

### Read more about the development process

You can find the series of the posts about how this extension developed step by step in [medium.com](https://medium.com/@moshfeu/comparefolders-visual-studio-code-extension-journey-intro-b540a0539629?source=friends_link&sk=db37e1889766ccd8fe553958a12a8f69).

## Contributors

<table>
  <tr>
    <td>
      <a href="https://github.com/llgcode" target="_blank">
        <img width="40" height="40" src="https://avatars3.githubusercontent.com/u/524083?s=88&v=4" alt="llgcode">
        <div>
          llgcode
        </div>
      </a>
    </td>
  </tr>
</table>

## Like the extension?

Show your love

- [⭐️](https://github.com/moshfeu/vscode-compare-folders)
- [Give it 5 ⭐️](https://marketplace.visualstudio.com/items?itemName=moshfeu.compare-folders&ssr=false#review-details)

## Isn't working as expected?

Please create [an issue](https://github.com/moshfeu/vscode-compare-folders/issues/new)

## Changelog

You can find it [here](/CHANGELOG.md)

## Credits
Activity bar's icon (and more) by [Stockio.com](https://www.stockio.com/free-icon/folders)
Null icon made from <a href="http://www.onlinewebfonts.com/icon">Icon Fonts</a> is licensed by CC BY 3.0
External link icon made by <a href="https://www.flaticon.com/authors/dave-gandy" title="Dave Gandy">Dave Gandy</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>
