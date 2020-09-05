[![Build Status](https://dev.azure.com/moshfeu-vscode/CompareFoldersExtension/_apis/build/status/moshfeu.vscode-compare-folders?branchName=master)](https://dev.azure.com/moshfeu-vscode/CompareFoldersExtension/_build/latest?definitionId=1&branchName=master)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-yellow.svg?style=flat)](https://github.com/Coding-Coach/find-a-mentor/issues)
[![The MIT License](https://flat.badgen.net/badge/license/MIT/orange)](http://opensource.org/licenses/MIT)
[![GitHub](https://flat.badgen.net/github/release/moshfeu/vscode-compare-folders)](https://github.com/moshfeu/vscode-compare-folders/releases)
[![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/installs-short/moshfeu.compare-folders.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=moshfeu.compare-folders)
[![Follow me on Twitter](https://img.shields.io/twitter/follow/moshfeu.svg?style=social)](https://twitter.com/moshfeu)

The extension allows you to compare folders, show the diffs in a list and present diff in a splitted view side by side.

![Screen record](https://user-images.githubusercontent.com/3723951/82501126-67607700-9afd-11ea-9578-8526f6172143.gif)

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
- `compareContent` - boolean - Compares files by content
- `diffViewTitle` - One of the options: "name only", "compared path", "full path"
- `ignoreFileNameCase` - boolean - Compare files with the same name but different case
- `diffLayout` - One of the options: "local <> compared" or "compared <> local"
- `showIdentical` - boolean - Whether or not show the identical files panel
- `useDiffMerge` - boolean - Whether or not using [`Diff & Merge`](https://marketplace.visualstudio.com/items?itemName=moshfeu.diff-merge) extension as the Diff viewer. In order to use this option, you should install the extension

**Example**

```json
"compareFolders.excludeFilter": [
  "**/node_modules",
  "**/.svn",
  "**/.git"
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