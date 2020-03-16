[![Build Status](https://dev.azure.com/moshfeu-vscode/CompareFoldersExtension/_apis/build/status/moshfeu.vscode-compare-folders?branchName=master)](https://dev.azure.com/moshfeu-vscode/CompareFoldersExtension/_build/latest?definitionId=1&branchName=master)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-yellow.svg?style=flat)](https://github.com/Coding-Coach/find-a-mentor/issues)
[![The MIT License](https://flat.badgen.net/badge/license/MIT/orange)](http://opensource.org/licenses/MIT)
[![GitHub](https://flat.badgen.net/github/release/moshfeu/vscode-compare-folders)](https://github.com/moshfeu/vscode-compare-folders/releases)
[![Visual Studio Marketplace](https://vsmarketplacebadge.apphb.com/installs-short/moshfeu.compare-folders.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=moshfeu.compare-folders)
[![Follow me on Twitter](https://img.shields.io/twitter/follow/moshfeu.svg?style=social)](https://twitter.com/moshfeu)

The extension allows the user to compare folders, show the diffs in a list and present diff in a splitted view side by side.

![Screen record](https://user-images.githubusercontent.com/3723951/71845669-7ce67e80-30d1-11ea-8a66-54222a8c628f.gif)

## Options (under vscode settings)

- `excludeFilter` - glob string
- `includeFilter` - glob string
- `compareContent` - boolean - Compares files by content
- `diffViewTitle` - One of the options: "name only", "compared path", "full path"
- `ignoreFileNameCase` - boolean - Compare files with the same name but different case
- `diffLayout` - One of the options: "local <> compared" or "compared <> local"

**Example**

```json
"compareFolders.excludeFilter": [
  "**/node_modules",
  "**/.svn",
  "**/.git"
]
```

### Notice
- The extension works only when the vscode instance has one workspace (or one folder) or more. It's not working for [empty workspace](https://user-images.githubusercontent.com/3723951/70967746-d560c800-209f-11ea-8148-12c5251b00ea.png).

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

## Credits
Activity bar's icon (and more) by [Stockio.com](https://www.stockio.com/free-icon/folders)
Null icon made from <a href="http://www.onlinewebfonts.com/icon">Icon Fonts</a> is licensed by CC BY 3.0
External link icon made by <a href="https://www.flaticon.com/authors/dave-gandy" title="Dave Gandy">Dave Gandy</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>