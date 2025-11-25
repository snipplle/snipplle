import { javascript } from '@codemirror/lang-javascript'
import { markdown } from '@codemirror/lang-markdown'
import { sql } from '@codemirror/lang-sql'
import { rust } from '@codemirror/lang-rust'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { json } from '@codemirror/lang-json'
import { yaml } from '@codemirror/lang-yaml'
import { xml } from '@codemirror/lang-xml'
import { go } from '@codemirror/lang-go'
import { php } from '@codemirror/lang-php'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { vue } from '@codemirror/lang-vue'

export const languages: Record<string, any> = {
  js: javascript(),
  ts: javascript({ typescript: true }),
  md: markdown(),
  sql: sql(),
  rs: rust(),
  py: python(),
  java: java(),
  json: json(),
  yaml: yaml(),
  xml: xml(),
  go: go(),
  php: php(),
  html: html(),
  css: css(),
  vue: vue(),
}
