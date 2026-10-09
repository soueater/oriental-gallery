import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, BookX } from 'lucide-react'
import { monthlyVisits } from '../content'
import { VisitChart } from './VisitChart'
import { usePaperTransition } from '../hooks/usePaperTransition'

export function Ledger({ children, enabled }: { children: ReactNode; enabled: boolean }) {
  const [open, setOpen] = useState(true)
  const [page, setPage] = useState(0)
  const toggle = useRef<HTMLButtonElement>(null)
  const turn = usePaperTransition(page, enabled && open, 'page')
  const cover = usePaperTransition(String(open), enabled, 'cover')
  const setCover = (value: boolean) => { cover.prepare(); setOpen(value) }
  return <div className="ledger-exhibit" data-reveal>
    <div className="ledger-toolbar"><span>山水之间 · 观展簿</span><button ref={toggle} className="text-link" aria-expanded={open} aria-controls="ledger-pages" aria-label={open ? '合上观展簿' : '打开观展簿'} onClick={() => setCover(!open)}>{open ? <BookX size={20} /> : <BookOpen size={20} />}{open ? '合簿' : '启簿'}</button></div>
    <div ref={cover.host} className={`ledger ${open ? 'ledger-open' : 'ledger-closed'}`}>
      <div ref={cover.content} className="ledger-surface">
      {!open && <button className="ledger-cover" onClick={() => { setCover(true); toggle.current?.focus() }} aria-label="打开观展簿"><span className="cover-thread" aria-hidden="true" /><span className="cover-title">山水观展簿<small>丙午 · 秋录</small></span><BookOpen size={27} /></button>}
      <div ref={turn.host} className="ledger-pages" id="ledger-pages" hidden={!open}>
        <div className="ledger-page ledger-verso">{children}<span className="folio-number">一</span></div>
        <div ref={turn.content} className="ledger-page ledger-recto" key={page}>
          {page === 0 ? <VisitChart /> : <div className="ledger-records"><div className="chart-heading"><span>观展月录</span><span className="demo-label">演示数据</span></div><table><caption>二〇二六年 · 观展足迹</caption><thead><tr><th scope="col">月份</th><th scope="col">观展人次</th></tr></thead><tbody>{monthlyVisits.map((value, index) => <tr key={index}><th scope="row">{['四月', '五月', '六月', '七月', '八月', '九月'][index]}</th><td>{value}</td></tr>)}</tbody></table><p className="chart-source">单位：人次 · 来源：前端演示数据集<br />此簿为演示记录，不代表实际访问。</p></div>}
          <span className="folio-number">{page === 0 ? '二' : '三'}</span>
        </div>
        <span className="book-binding" aria-hidden="true" />
      </div>
      </div>
    </div>
    {open && <div className="ledger-pagination"><button className="icon-button" aria-label="观展簿上一页" title="上一页" disabled={page === 0} onClick={() => { turn.prepare(); setPage(0) }}><ArrowLeft size={20} /></button><span aria-live="polite">{page === 0 ? '卷一 · 墨图' : '卷二 · 月录'}</span><button className="icon-button" aria-label="观展簿下一页" title="下一页" disabled={page === 1} onClick={() => { turn.prepare(); setPage(1) }}><ArrowRight size={20} /></button></div>}
  </div>
}
