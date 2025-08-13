/*
# Aura-wasm

Copyright © 2025 Litebrowsers
Licensed under a Proprietary License

This software is the confidential and proprietary information of Litebrowsers
Unauthorized copying, redistribution, or use is prohibited.
For licensing inquiries, contact:
vera cohopie at gmail dot com
thor betson at gmail dot com
*/

export default function () {
  const defaultFallbacks = ['serif', 'sans-serif', 'monospace', 'cursive', 'system-ui']

  const allTestString = '\u{1F6CD}1>\'`amlρiюदे來\uEBCB\uE82F\u02E6\uD855\uDD78\u306B\u25CC\u{2003E}\u{529}\u{528}' +
      '\u{020D0}∫∑{\'\u0A0A\u2623\u062B\u17cc\uEBCB\uE82Fहै।က౪౫汉॥范準ஒ=3\u062B\u0954\u0B5D\uF71D\u0E21◌̊\u{26fd}'

  function fontsResult (fontsMap, fontsSize) {
    const repeated = []
    const hashes = []
    fontsMap.forEach((value, key) => {
      hashes.push(key)
      if (value.entries.length > 1) {
        let entryString
        if (value.entries.length === fontsSize) {
          entryString = 'ALL'
        } else {
          entryString = value.entries.toString()
        }
        repeated.push(key + ': ' + entryString)
      }
    })
    return {
      detected: fontsMap.size,
      fontsAmount: fontsSize,
      repeated: repeated,
      hashes: hashes
    }
  }

  const someResult = {
    fallbacks: fontsResult(renderFonts(defaultFallbacks, allTestString), defaultFallbacks.length),
  }

  const simpleResult = {
    fallbackHash: someResult.fallbacks.hashes
  }

  return simpleResult
}

function renderFonts (testFonts, testString) {
  function FontResult (crc) {
    this.entries = []
  }

  function bin2hex (s) {
    const f = s.length
    const a = []
    for (let i = 0; i < f; i++) {
      a[i] = s.charCodeAt(i).toString(16)
    }
    return a.join('')
  }

  const fontsResult = new Map()

  for (let n = 0; n < testFonts.length; n++) {
    const currentFont = testFonts[n]
    const c = document.createElement('canvas')
    c.width = 350
    c.height = 50
    const ctx = c.getContext('2d')
    ctx.font = 'italic 10px ' + currentFont
    ctx.fillStyle = 'red'
    ctx.fillText(testString, 10, 30)
    const b64 = c.toDataURL().replace('data:image/png;base64,', '')
    const bin = atob(b64)
    // crc32 takes only 4 bytes and placed from 16 to 12 byte from the end of file
    const crc = bin2hex(bin.slice(-16, -12))
    if (fontsResult.has(crc)) {
      fontsResult.get(crc).entries.push(currentFont)
    } else {
      const result = new FontResult(crc)
      result.entries.push(currentFont)
      fontsResult.set(crc, result)
    }
  }

  return fontsResult
}
