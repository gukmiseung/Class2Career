import { readFileSync, writeFileSync } from 'node:fs'

const sourceDirectory = new URL('../../supabase/functions/_shared/roadmap/', import.meta.url)
const targetDirectory = new URL('../src/roadmap/', import.meta.url)
const files = ['contracts.ts', 'compareConceptCoverage.ts']
const header = '// Generated from the Supabase roadmap modules. Run node frontend/scripts/sync-roadmap-shared.mjs to update.\n'
const [mode, ...extra] = process.argv.slice(2)

if (extra.length || (mode !== undefined && mode !== '--check')) {
  console.error('Usage: node frontend/scripts/sync-roadmap-shared.mjs [--check]')
  process.exit(2)
}

for (const file of files) {
  const source = readFileSync(new URL(file, sourceDirectory), 'utf8').replaceAll('\r\n', '\n')
  const target = new URL(file, targetDirectory)
  const expected = header + source

  if (mode === '--check') {
    if (readFileSync(target, 'utf8').replaceAll('\r\n', '\n') !== expected) {
      console.error(`Roadmap copy is out of sync: ${file}. Run the sync script without --check.`)
      process.exitCode = 1
    }
  } else {
    writeFileSync(target, expected)
  }
}
