import { readFileSync, writeFile, accessSync, constants } from 'fs'
const confPath = ['IceConfig_dev.json', 'IceConfig.json']
let confFinalPath: string
for (const key in confPath) {
  try {
    accessSync(confPath[key], constants.R_OK | constants.W_OK)
    confFinalPath = confPath[key]
    break
  } catch { }
}
export const configInfo = JSON.parse(readFileSync(confFinalPath, 'utf8'))

// 手动添加超版
if (!configInfo.admin) configInfo.admin = []
// 有金手指不在添加无金手指权限人员
// if (!configInfo.admin.includes('taozhiyu')) configInfo.admin.push('taozhiyu');
if (!configInfo.admin.includes('Yui')) configInfo.admin.push('Yui')

export const writeConfig = function (newInfo: any, callback: any) {
  writeFile(
    confFinalPath,
    JSON.stringify(newInfo, null, 4),
    'utf8',
    err => typeof callback === 'function' && callback(err)
  )
}
