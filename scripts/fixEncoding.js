const fs = require('fs')
const path = require('path')

const target = path.join(process.cwd(), 'meeting-cost-analyzer', 'app', 'api', 'get-hourly-rate', 'route.ts')
if (!fs.existsSync(target)) {
  console.error('File not found', target)
  process.exit(1)
}

const buf = fs.readFileSync(target)
console.log('First bytes:', buf.slice(0,4).toString('hex'))

if (buf[0] === 0xFF && buf[1] === 0xFE) {
  console.log('Detected UTF-16 LE BOM — converting to UTF-8')
  const content = fs.readFileSync(target, 'utf16le')
  fs.writeFileSync(target, content, 'utf8')
  console.log('Converted to UTF-8')
  process.exit(0)
}

try {
  const td = new TextDecoder('utf-8', { fatal: true })
  td.decode(buf)
  console.log('File is valid UTF-8')
  process.exit(0)
} catch (e) {
  console.log('Not valid UTF-8; attempting latin1 -> utf8 conversion')
  const content = fs.readFileSync(target, 'latin1')
  fs.writeFileSync(target, content, 'utf8')
  console.log('Wrote file as UTF-8 (from latin1)')
  process.exit(0)
}
