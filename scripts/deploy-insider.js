const fs = require('fs');
const cp = require('child_process');
const dotenv = require('dotenv');
dotenv.config();

const writeOptions = {
  encoding: 'utf8'
}

cp.execSync('git checkout package.json README.md', writeOptions)

const package = require('../package.json');
const promises = [];
// package.json
package.displayName += ' - Insider';
package.galleryBanner.color = '#daf8d6';
package.name += '-insider';
package.version = process.env.VERSION || package.version;
promises.push(
  fs.promises.writeFile('./package.json', JSON.stringify(package, null, 2))
)

// readme
let readme = fs.readFileSync('./README.md', writeOptions);
readme = `
## Insider version

🙏 Thank you for using the Insider version.<br />
👍 Please don't rate this app.<br />
🥳 If you like it, rate the [real one](https://marketplace.visualstudio.com/items?itemName=moshfeu.compare-folders).<br />
💅 If you don't (that's ok 😀), or if you find any issues, please [open an issue](https://github.com/moshfeu/vscode-compare-folders/issues/new) or [email me](mailto:moshfeu.dev@gmail.com)<br />

--------------------------------------------

` + readme;
promises.push(
  fs.promises.writeFile('./README.md', readme, writeOptions)
)

Promise.all(promises).then(async () => {
  try {
    await deploy();
    console.log('done');
  } catch (error) {
    console.log('!error', error);
  } finally {
    cp.execSync('git checkout package.json README.md', writeOptions);
  }
})

function deploy() {
  return new Promise((resolve, reject) => {
    cp
      .spawn('yarn', ['deploy', process.env.TOKEN], {
        stdio: 'inherit',
      })
      .on('exit', (code, signal) => {
        if (code !== 1) {
          resolve(signal);
        } else {
          reject(signal)
        }
      })
  })
}