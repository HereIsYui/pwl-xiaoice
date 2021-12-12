const { readFileSync, writeFile, accessSync, constants } = require('fs');
const confPath = ['config_dev.json', 'config.json'];
let confFinalPath;
for (const key in confPath) {
    try {
        accessSync(confPath[key], constants.R_OK | constants.W_OK);
        confFinalPath = confPath[key];
        break;
    } catch {}
}
const configInfo = JSON.parse(readFileSync(confFinalPath, 'utf8'));

//手动添加超版
if (!configInfo.admin) configInfo.admin = [];
if (!configInfo.admin.includes('taozhiyu')) configInfo.admin.push('taozhiyu');
if (!configInfo.admin.includes('Yui')) configInfo.admin.push('Yui');



function writeConfig(newInfo, callback) {
    writeFile(
        confFinalPath,
        JSON.stringify(newInfo, null, 4),
        'utf8',
        err => typeof callback === 'function' && callback(err)
    );
}
module.exports = { configInfo, writeConfig };
