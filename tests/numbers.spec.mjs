import assert from 'node:assert/strict'
import { chineseNumber, chineseNumbers } from '../src/typography/numbers.ts'
import { sealText, sealProps } from '../src/typography/text.ts'

for (const [value, text] of [[0, '零'], [3, '三'], [10, '十'], [11, '十一'], [20, '二十'], [101, '一百零一'], [128, '一百二十八'], [246, '二百四十六'], [1005, '一千零五'], [1010, '一千零一十'], [10010, '一萬零一十'], [100000001, '一億零一'], [-12, '負十二'], [3.14, '三點一四']]) assert.equal(chineseNumber(value), text)
assert.equal(chineseNumbers('2026 年 4—9 月 / 03'), '二零二六 年 四—九 月 / 三')
assert.equal(sealText('至少 5 个字'), '至少 五 個字')
assert.equal(sealText('二〇二六'), '二零二六')
assert.equal(sealProps('text', { children: 128, x: 52 }).children, '一百二十八')
assert.equal(sealProps('text', { children: 128, x: 52 }).x, 52)
console.log('Chinese number formatting: 19 assertions passed')
