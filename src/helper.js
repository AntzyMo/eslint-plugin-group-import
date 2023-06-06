// 解析行尾符是 \r\n -> CRLF 还是 \n -> LF
export function resolveEndOfLine(sourceCode) {
  return sourceCode.match(/(\r\n|\n){1}/g)[0]
}
