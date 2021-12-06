const { readFileSync, writeFile } = require('fs');
const confPath = 'config.json';
const configInfo = JSON.parse(readFileSync(confPath, 'utf8'));
function writeConfig(newInfo, callback) {
    writeFile(
        confPath,
        JSON.stringify(newInfo, null, 4),
        'utf8',
        err => typeof callback === 'function' && callback(err)
    );
}
module.exports = { configInfo, writeConfig };
