import { useState } from 'react'
import { monthlyVisits } from '../content'

export function VisitChart() {
  const [active, setActive] = useState<number | null>(null)
  const y = (value: number) => 185 - value / 300 * 145
  return <div className="visit-chart">
    <div className="chart-heading"><span>观展足迹</span><span className="demo-label">演示数据</span></div>
    <svg viewBox="0 0 520 220" role="img" aria-label="2026年4月至9月演示访问量，依次为128、156、142、195、218、246人次">
      {[0, 100, 200, 300].map(value => <g key={value}><line x1="52" y1={y(value)} x2="507" y2={y(value)} stroke="#C8C9BD" strokeDasharray={value ? '2 5' : '0'} /><text x="0" y={y(value) + 4}>{value}</text></g>)}
      {monthlyVisits.map((value, index) => <rect key={index} x={62 + index * 76} y={y(value)} width="30" height={185 - y(value)} fill={index === active ? 'var(--cinnabar)' : 'var(--pine)'} opacity={index === active ? 1 : 0.68} />)}
      {active !== null && <g aria-hidden="true"><rect x={Math.min(263, 43 + active * 76)} y="0" width="244" height="32" rx="2" fill="#272B28" /><text className="chart-tooltip" x={Math.min(263, 43 + active * 76) + 122} y="22" textAnchor="middle">{active + 4}月 · {monthlyVisits[active]} 人次</text></g>}
    </svg>
    <div className="chart-access" aria-label="各月观展人次">{monthlyVisits.map((value, index) => <button
      key={index} aria-label={`${index + 4}月，${value}人次`} aria-pressed={active === index} className={active === index ? 'active' : ''}
      onMouseEnter={() => setActive(index)} onFocus={() => setActive(index)} onClick={() => setActive(index)}>{index + 4}月</button>)}</div>
    <p className="chart-source">2026 年 4—9 月 · 单位：人次<br />来源：本展馆前端演示数据集，不代表实际访问记录</p>
  </div>
}
