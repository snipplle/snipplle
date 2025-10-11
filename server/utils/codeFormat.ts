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
