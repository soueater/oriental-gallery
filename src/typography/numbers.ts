const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
const units = ['', '十', '百', '千']

function integer(value: number, omitLeadingOne = true): string {
  if (value === 0) return digits[0]
  for (const [base, unit] of [[100000000, '億'], [10000, '萬']] as const) {
    if (value >= base) {
      const remainder = value % base
      return integer(Math.floor(value / base), omitLeadingOne) + unit + (remainder
        ? (remainder < base / 10 ? digits[0] : '') + integer(remainder, false) : '')
    }
  }
  const source = String(value)
  let result = '', zero = false
  for (let index = 0; index < source.length; index++) {
    const digit = Number(source[index])
    if (digit === 0) { zero = result.length > 0; continue }
    if (zero) result += digits[0]
    result += digits[digit] + units[source.length - index - 1]
    zero = false
  }
  return omitLeadingOne && value < 20 ? result.replace(/^一十/, '十') : result
}

export function chineseNumber(value: number): string {
  if (!Number.isFinite(value)) return String(value)
  const [whole, fraction] = String(Math.abs(value)).split('.')
  const amount = Number(whole)
  const formatted = Number.isSafeInteger(amount) ? integer(amount) : [...whole].map(digit => digits[Number(digit)] || digit).join('')
  return (value < 0 ? '負' : '') + formatted + (fraction ? '點' + [...fraction].map(digit => digits[Number(digit)]).join('') : '')
}

export function chineseNumbers(text: string): string {
  return text.replace(/\d+(?:\.\d+)?/g, value => /^(19|20)\d{2}$/.test(value)
    ? [...value].map(digit => digits[Number(digit)]).join('') : chineseNumber(Number(value)))
}
