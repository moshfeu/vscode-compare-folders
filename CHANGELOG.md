## Change log

**0.11.0**

- Allow to swap sides ([#14](https://github.com/moshfeu/vscode-compare-folders/issues/14))
- Add identical files panel (under [configuration](https://github.com/moshfeu/vscode-compare-folders#options-under-vscode-settings)) ([#28](https://github.com/moshfeu/vscode-compare-folders/issues/28))

**0.10.0**

- Show theme files icons instead of custom (uniform and boring) files icons
- Allow to compare 2 selected folders (adds a context menu `Compare selected folders`) ([#26](https://github.com/moshfeu/vscode-compare-folders/issues/26))
- Added 2 commands in the command palette
  - `Compare a folder against workspace` (when workspace is not empty)
  - `Choose 2 folders and compare` - as it sounds

**0.9.0**

Allow to choose 2 folders without having to open one of them as a workspace.

If there is one folder in the workspace, it will compare this with the one the user choose.
If there are more than one folder, it let's the user to choose one of the folders and then, the a different folder to compare.

**0.8.0**

Allow the change diff view's sides ([#21](https://github.com/moshfeu/vscode-compare-folders/issues/21))

**0.7.0**

Added the ability to ignore files names' case when comparing ([#23](https://github.com/moshfeu/vscode-compare-folders/issues/23))

**0.6.0**

Added the ability to choose the compare tab's title format ([#13](https://github.com/moshfeu/vscode-compare-folders/issues/13))

**0.5.0**

Thanks to [@llgcode](https://github.com/llgcode)!

- The [bug](https://github.com/moshfeu/vscode-compare-folders/issues/10) that prevent windows users to use the extension fixed
- Added the ability to include / exclude paths from comparing via the extension configuration (vscode settings)
- Added progress bar while comparing for a better UX

**0.4.0**

Show missing/additional files [#9](https://github.com/moshfeu/vscode-compare-folders/issues/9) (Thanks to [@fbaligand](https://github.com/fbaligand))

<img width="334" alt="missing/additional files screenshot" src="https://user-images.githubusercontent.com/3723951/71563330-90bd2f80-2a96-11ea-91b3-e2f531f2f74d.png">

**0.3.0**

Support multiple workspaces

<img width="496" alt="Multiple workspaces screenshot" src="https://user-images.githubusercontent.com/3723951/71128162-44036a00-21f5-11ea-88fe-9c2519b8a2e8.png">

**0.2.0**
- Improve UI: [#5](https://github.com/moshfeu/vscode-compare-folders/issues/5), [#6](https://github.com/moshfeu/vscode-compare-folders/issues/6), [#7](https://github.com/moshfeu/vscode-compare-folders/issues/7) thanks to [@gjsjohnmurray](https://github.com/gjsjohnmurray)
- Supports dark mode!