
import Colors = require('colors.ts');
Colors.enable();

export const LOGGER = {
  Log: function (log: string): void {
    console.log(log)
  },
  Err: function (log: string): void {
    console.log(log.error)
  },
  Warn: function (log: string): void {
    console.log(log.warning)
  },
  Succ: function (log: string): void {
    console.log(log.green)
  }
}