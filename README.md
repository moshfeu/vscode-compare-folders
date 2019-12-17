[![Build Status](https://dev.azure.com/moshfeu-vscode/CompareFoldersExtension/_apis/build/status/moshfeu.vscode-compare-folders?branchName=master)](https://dev.azure.com/moshfeu-vscode/CompareFoldersExtension/_build/latest?definitionId=1&branchName=master)

The extension allows the user to compare folders, show the diffs in a list and present diff in a splitted view side by side.

![screen record](https://user-images.githubusercontent.com/3723951/66277133-cb9e3580-e8a2-11e9-9149-383a8683fcd1.gif)

### Notice
- The extension works only when the vscode instance has only one workspace (or one folder). It's not working for [empty workspace](https://user-images.githubusercontent.com/3723951/70967746-d560c800-209f-11ea-8148-12c5251b00ea.png) or [multiple workspaces](https://user-images.githubusercontent.com/3723951/70967800-148f1900-20a0-11ea-8a57-e7ab028e8cdf.png).

- The extension shows only differences in files at the same path with different content. For example:

```
folderA/file.txt
folderB/file.txt
```

It will not show differences in

```
folderA/file.txt
folderB/folderA/file.txt
```

In this case, the extension will show a message that it couldn't find any changes

You can find the series of the posts about how this extension developed step by step in [medium.com](https://medium.com/@moshfeu/comparefolders-visual-studio-code-extension-journey-intro-b540a0539629?source=friends_link&sk=db37e1889766ccd8fe553958a12a8f69).



## Credits
Activity bar's icon (and more) by [Stockio.com](https://www.stockio.com/free-icon/folders)
Null icon made from <a href="http://www.onlinewebfonts.com/icon">Icon Fonts</a> is licensed by CC BY 3.0
External link icon made by <a href="https://www.flaticon.com/authors/dave-gandy" title="Dave Gandy">Dave Gandy</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>