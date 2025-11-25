import beautify from 'js-beautify'

export function beautifyCode(code: string): string {
  const unescaped = code
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")

  return beautify(unescaped, {
    indent_size: 2,
    indent_char: ' ',
  })
}

export const contentTypes: Record<string, string> = {
  ts: 'application/typescript',
  js: 'application/javascript',
  html: 'text/html',
  css: 'text/css',
  json: 'application/json',
  md: 'text/markdown',
  xml: 'application/xml',
  yaml: 'application/x-yaml',
  sql: 'application/sql',
  php: 'application/x-httpd-php',
  py: 'text/x-python',
  go: 'text/x-go',
  rs: 'text/rust',
  java: 'text/x-java-source',
  vue: 'text/x-vue',
}
