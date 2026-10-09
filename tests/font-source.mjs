import ts from 'typescript'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { sealText } from '../src/typography/text.ts'

const copy = []
async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = new URL(entry.name, directory)
    if (entry.isDirectory()) await scan(new URL(`${entry.name}/`, directory))
    else if (/\.tsx?$/.test(entry.name)) {
      const source = ts.createSourceFile(path.pathname, await readFile(path, 'utf8'), ts.ScriptTarget.Latest, true, entry.name.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
      function visit(node) {
        if ((ts.isStringLiteralLike(node) || ts.isJsxText(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) && /[\u3400-\u9fff]/.test(node.text)) copy.push(sealText(node.text))
        ts.forEachChild(node, visit)
      }
      visit(source)
    }
  }
}
await scan(new URL('../src/', import.meta.url))
await writeFile(new URL('../test-results/source-copy.json', import.meta.url), JSON.stringify(copy))
console.log(`Audited ${copy.length} Chinese source strings`)
