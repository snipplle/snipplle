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

export const additionalLanguages = [
  {
    name: 'markdown',
    extensions: ['md'],
    language: markdown(),
  },
  {
    name: 'sql',
    extensions: ['sql'],
    language: sql(),
  },
  {
    name: 'rust',
    extensions: ['rs'],
    language: rust(),
  },
  {
    name: 'python',
    extensions: ['py'],
    language: python(),
  },
  {
    name: 'java',
    extensions: ['java'],
    language: java(),
  },
  {
    name: 'json',
    extensions: ['json'],
    language: json(),
  },
  {
    name: 'yaml',
    extensions: ['yaml'],
    language: yaml(),
  },
  {
    name: 'xml',
    extensions: ['xml'],
    language: xml(),
  },
  {
    name: 'go',
    extensions: ['go'],
    language: go(),
  },
  {
    name: 'php',
    extensions: ['php'],
    language: php(),
  },
]
