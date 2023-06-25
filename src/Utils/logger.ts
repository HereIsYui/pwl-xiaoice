import Colors = require('colors.ts');
import * as dayjs from 'dayjs'
Colors.enable()

export const LOGGER = {
  Log: function (log: string, type: number): void {
    log = LogAddTag(log, type)
    console.log(log)
  },
  Err: function (log: string, type: number): void {
    log = LogAddTag(log, type)
    console.log(log.error)
  },
  Warn: function (log: string, type: number): void {
    log = LogAddTag(log, type)
    console.log(log.warning)
  },
  Succ: function (log: string, type: number): void {
    log = LogAddTag(log, type)
    console.log(log.green)
  }
}

function LogAddTag (log: string, type: number) {
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
  return `${['[System]', '[IceNet]'][type]} ${now} ${log}`
}
