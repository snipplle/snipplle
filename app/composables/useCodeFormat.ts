import jsStringEscape from 'js-string-escape'
import beautify from 'js-beautify'

import type { UseCodeFormat } from '~/types/global.types'

export function useCodeFormat(): UseCodeFormat {
  const beautifyCode = (code: string): string => {
    const unescaped = code
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")

    return beautify(unescaped, {
      indent_size: 2,
      indent_char: ' ',
    })
  }

  const minifyCode = (code: string): string => {
    return jsStringEscape(code)
  }

  return {
    beautifyCode,
    minifyCode,
  }
}
