import { Converter, CustomConverter } from 'opencc-js/cn2t'
import { chineseNumber, chineseNumbers } from './numbers.ts'

const convert = Converter({ from: 'cn', to: 't' })
const standardGlyphs = CustomConverter([['叄', '參'], ['峯', '峰'], ['爲', '為'], ['着', '著'], ['羣', '群'], ['啓', '啟'], ['〇', '零']])
const cache = new Map<string, string>()
export function sealText(text: string): string {
  if (!/[\u3400-\u9fff〇\d]/.test(text)) return text
  const known = cache.get(text)
  if (known !== undefined) return known
  const result = standardGlyphs(convert(chineseNumbers(text)))
  if (cache.size < 1000) cache.set(text, result)
  return result
}

// Format visible copy and spoken numbers without changing numeric attributes or data.
export function sealProps(type: unknown, input: unknown) {
  if (!input || typeof input !== 'object') return input
  const props = input as Record<string, unknown>
  const children = props.children
  const convertChild = (child: unknown): unknown => typeof child === 'string' ? sealText(child)
    : typeof child === 'number' ? chineseNumber(child)
    : Array.isArray(child) ? child.map(convertChild) : child
  const next: Record<string, unknown> = { ...props, children: convertChild(children) }
  const plainText = (child: unknown): string => typeof child === 'string' || typeof child === 'number' ? String(child)
    : Array.isArray(child) ? child.map(plainText).join('') : ''
  if (typeof type === 'string' && /^(button|a|h[1-6])$/.test(type) && !props['aria-label'] && !props['aria-labelledby']) {
    const label = plainText(children).trim()
    if (label) next['aria-label'] = chineseNumbers(label)
  }
  if (typeof type === 'string') for (const key of ['placeholder', 'title']) if (typeof props[key] === 'string') next[key] = sealText(props[key])
  if (typeof type === 'string' && typeof props['aria-label'] === 'string') next['aria-label'] = chineseNumbers(props['aria-label'])
  return next
}
