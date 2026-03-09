const fs = require('fs')
const path = require('path')

const root = process.cwd()
const exts = ['.ts', '.tsx', '.js', '.jsx', '.css', '.json', '.md']

function walk(dir) {
  const res = []
  const list = fs.readdirSync(dir)
  for (const name of list) {
    const p = path.join(dir, name)
    try {
      const stat = fs.statSync(p)
      if (stat.isDirectory()) {
        // skip node_modules and .git
        if (name === 'node_modules' || name === '.git') continue
        res.push(...walk(p))
      } else {
        if (exts.includes(path.extname(name))) res.push(p)
      }
    } catch (e) {
      // ignore
    }
  }
  return res
}

function check(file) {
  const buf = fs.readFileSync(file)
  try {
    const td = new TextDecoder('utf-8', { fatal: true })
    td.decode(buf)
    return true
  } catch (e) {
    return false
  }
}

const files = walk(root)
let bad = []
for (const f of files) {
  if (!check(f)) bad.push(f)
}

if (bad.length === 0) {
  console.log('All checked files are valid UTF-8')
  process.exit(0)
} else {
  console.log('Files with invalid UTF-8:')
  for (const b of bad) console.log(b)
  process.exit(2)
}
