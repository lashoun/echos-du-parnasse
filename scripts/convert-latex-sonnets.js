#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs')
const path = require('path')

const LATEX_DIR = path.resolve(__dirname, '..', 'data', 'latex')
const OUTPUT_DIR = path.resolve(__dirname, '..', 'data')

const AUTHORS = {
  banville: 'Théodore de Banville', gautier: 'Théophile Gautier',
  heredia: 'José-Maria de Heredia', lecontedelisle: 'Leconte de Lisle',
  mendes: 'Catulle Mendès', prudhomme: 'Sully Prudhomme',
}

const ACCENT_MAP = {
  "\\'a": 'á',"\\'A": 'Á',"\\'e": 'é',"\\'E": 'É',"\\'i": 'í',"\\'I": 'Í',
  "\\'o": 'ó',"\\'O": 'Ó',"\\'u": 'ú',"\\'U": 'Ú',"\\'c": 'ć',"\\'C": 'Ć',
  "\\`a": 'à',"\\`A": 'À',"\\`e": 'è',"\\`E": 'È',"\\`i": 'ì',"\\`I": 'Ì',
  "\\`o": 'ò',"\\`O": 'Ò',"\\`u": 'ù',"\\`U": 'Ù',
  '\\^a': 'â','\\^A': 'Â','\\^e': 'ê','\\^E': 'Ê','\\^i': 'î','\\^I': 'Î',
  '\\^o': 'ô','\\^O': 'Ô','\\^u': 'û','\\^U': 'Û',
  '\\"a': 'ä','\\"A': 'Ä','\\"e': 'ë','\\"E': 'Ë','\\"i': 'ï','\\"I': 'Ï',
  '\\"o': 'ö','\\"O': 'Ö','\\"u': 'ü','\\"U': 'Ü',
  '\\~a': 'ã','\\~A': 'Ã','\\~n': 'ñ','\\~N': 'Ñ',
  '\\cc': 'ç','\\c{C}': 'Ç','\\c c': 'ç','\\c C': 'Ç',
  '\\oe': 'œ','\\OE': 'Œ','\\ae': 'æ','\\AE': 'Æ','\\i': 'ı',
  '\\--': '—','\\---': '—','ldots': '…','textemdash': '—','textendash': '–',
  'textquoteleft': "'",'textquoteright': "'",
  'textquotedblleft': '"','textquotedblright': '"',
}
const ACCENT_ENTRIES = Object.entries(ACCENT_MAP).sort((a, b) => b[0].length - a[0].length)

function normaliseLatex(text) {
  text = text.replace(/(^|[^\\])%.*/gm, '$1')
  text = text.replace(/\\&/g, '&')
  for (const [cmd, char] of ACCENT_ENTRIES) text = text.replaceAll(cmd, char)
  // Dashes: --- → em-dash, -- → en-dash
  text = text.replace(/---/g, '—')
  text = text.replace(/--/g, '–')
  text = text.split('\n').map(l => l.trim()).join('\n')
  text = text.replace(/\\\\![ \t]*\n?/g, '\n\n')
  text = text.replace(/\\\\[ \t]*\n?/g, '\n')
  text = text.replace(/^\n+|\n+$/g, '')
  text = text.replace(/\n{3,}/g, '\n\n')
  text = text.replace(/\\(?:smallskip|medskip|bigskip|vspace\*?\{[^}]*\}|hspace\*?\{[^}]*\}|\newline|par\b|noindent|clearpage|newpage|pagebreak)/g, '')
  text = text.replace(/\\(?:textsc|textit|textbf|emph|scshape|itshape|bfseries|small|scriptsize|footnotesize|normalsize)\s*(?:\{([^}]*)\})?/g, '$1')
  text = text.replace(/\\[a-z]+\*?(?:\[[^\]]*\])?\s*\{([^}]*)\}/g, (m, c) => {
    const cmd = m.match(/\\([a-z]+)/i)?.[1] ?? ''
    return ['textsc','textit','textbf','emph','scshape','itshape','bfseries',
            'small','scriptsize','footnotesize','normalsize','large','Large',
            'huge','Huge','texttt','textsf','textrm','textsl'].includes(cmd) ? c : m
  })
  text = text.replace(/[ \t]+\n/g, '\n').replace(/\n[ \t]+/g, '\n')
  text = text.replace(/[ \t]{2,}/g, ' ')
  // Convert \vin (LaTeX verse indent) to tab — escape backslash properly
  text = text.replace(new RegExp('\\\\vin', 'g'), '\t')
  // French typography: non-breaking space before : ; ! ?
  // LaTeX does this automatically, so .tex files often have "word!" with no space.
  // Normalize: strip any existing space/NBSP before punctuation, then add the correct one.
  text = text.replace(/(\S)[ \u00A0\u202F]*([!?;])/g, '$1\u202F$2')
  text = text.replace(/(\S)[ \u00A0\u202F]*(:)/g, '$1\u00A0$2')
  return text.trim()
}

function firstLineContent(text) {
  return text.replace(/\n.*/s, '').replace(/^[「""'']?\s*/, '').substring(0, 60).trim()
}

function parseSonnets(latex) {
  const sonnets = []
  const p = {
    pos: 0,
    skipSpace() { while (this.pos < latex.length && /\s/.test(latex[this.pos])) this.pos++ },
    nextIs(ch) { this.skipSpace(); return latex[this.pos] === ch },
    readOptional() {
      this.skipSpace()
      if (latex[this.pos] !== '[') return null
      const close = latex.indexOf(']', this.pos)
      if (close === -1) return null
      const val = latex.slice(this.pos + 1, close)
      this.pos = close + 1
      return val
    },
    readRequired() {
      this.skipSpace()
      if (latex[this.pos] !== '{') return null
      let depth = 1, i = this.pos + 1
      while (i < latex.length && depth > 0) {
        if (latex[i] === '{') depth++; else if (latex[i] === '}') depth--
        if (depth > 0) i++
      }
      if (depth !== 0) return null
      const val = latex.slice(this.pos + 1, i)
      this.pos = i + 1
      return val
    },
  }

  const regex = /\\sonnet/g
  let match
  let baseTitle = ''

  while ((match = regex.exec(latex)) !== null) {
    p.pos = match.index + match[0].length
    const preamble = []
    for (let i = 0; i < 3; i++) { const v = p.readOptional(); if (v === null) break; preamble.push(v) }
    let title = p.readRequired()
    if (title === null) continue
    let subtitle = null
    if (p.nextIs('[')) subtitle = p.readOptional()
    const centerVerse = p.readRequired()
    const content = p.readRequired()
    if (centerVerse === null || content === null) continue
    if (p.nextIs('[')) p.readOptional()

    const [collection] = preamble
    title = normaliseLatex(title).trim()
    const sub = subtitle ? normaliseLatex(subtitle).trim() || null : null

    if (!title && sub) {
      title = baseTitle ? `${baseTitle} (${sub})` : `(${sub})`
    } else if (!title) {
      const fl = firstLineContent(content)
      title = fl ? `${baseTitle || '(Sonnet)'} — ${fl}` : baseTitle || '(Sonnet)'
      baseTitle = title
    } else {
      baseTitle = title
      if (/^[IVXLCDM]+$/.test(title) && sub) title = `${title} — ${sub}`
      else if (sub) title = `${title} (${sub})`
    }

    sonnets.push({
      collection: collection ? normaliseLatex(collection).trim() || null : null,
      title,
      content: normaliseLatex(content).trim(),
    })
  }
  return sonnets
}

function main() {
  for (const [slug, authorName] of Object.entries(AUTHORS)) {
    const filePath = path.join(LATEX_DIR, `${slug}.tex`)
    if (!fs.existsSync(filePath)) { console.log(`⚠ Skipping ${slug}: ${slug}.tex not found`); continue }
    const sonnets = parseSonnets(fs.readFileSync(filePath, 'utf-8'))
    console.log(`  ${slug}.tex: ${sonnets.length} sonnet(s)`)
    const seen = new Set()
    const unique = []
    for (const s of sonnets) {
      const fp = s.title.toLowerCase() + '|' + s.content.replace(/\n.*/s, '').substring(0, 60).toLowerCase()
      if (!seen.has(fp)) { seen.add(fp); unique.push(s) }
    }
    const output = {
      author: authorName,
      poems: unique.map(s => ({ title: s.title, content: s.content, language: 'fr', collection: s.collection, tags: ['sonnet'] })),
    }
    const outPath = path.join(OUTPUT_DIR, `${slug}-sonnets.json`)
    fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n')
    console.log(`✅ ${slug}: ${unique.length}/${sonnets.length} sonnets → ${outPath}`)
  }
  console.log('\n✨ Conversion complete!')
}

main()
