import { colors, tty } from "cliffy/ansi/mod.ts"

// ref https://github.com/chalk/ansi-regex/blob/main/index.js
const ansi_escapes_rx = new RegExp([
  '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
  '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))'
].join('|'), 'g')

function ln(s: string, prefix: string) {
  // remove ansi escapes to get actual length
  const n = s.replace(ansi_escapes_rx, '').length + prefix.length + 1
  const { columns } = Deno.consoleSize(Deno.stdout.rid)
  return Math.ceil(n / columns)
}

export default function useLogger(prefix?: string) {
  return new Logger(prefix)
}

export const teal = (x: string) => colors.rgb8(x, 86);
export const red = colors.brightRed

export class Logger {
  readonly prefix: string
  lines = 0
  last_line = ''

  constructor(prefix?: string) {
    this.prefix = prefix ?? ''
  }

  //TODO don’t erase whole lines, just erase the part that is different
  replace(line: string) {
    if (line == this.last_line) {
      return  //noop
    }

    if (this.lines) {
      const n = ln(this.last_line, this.prefix)
      tty.cursorLeft.cursorUp(n).eraseDown()
      this.lines -= n
      if (this.lines < 0) throw new Error(`${n}`)
    }

    console.info(colors.gray(this.prefix), line)
    this.lines += ln(line, this.prefix)
    this.last_line = line
  }

  clear() {
    tty.cursorLeft.cursorUp(this.lines).eraseDown(this.lines)
    this.lines = 0
  }
}
