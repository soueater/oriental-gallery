import { useRef, useState } from 'react'
import { ArrowUpRight, Bookmark, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { artworks } from '../content'
import type { Artwork } from '../content'
import { ArtworkImage } from './ArtworkImage'
import { usePaperTransition } from '../hooks/usePaperTransition'

export function Handscroll({ saved, onSave, onOpen, enabled }: { saved: string[]; onSave: (artwork: Artwork) => void; onOpen: (artwork: Artwork) => void; enabled: boolean }) {
  const [selected, setSelected] = useState(0)
  const [open, setOpen] = useState(true)
  const toggle = useRef<HTMLButtonElement>(null)
  const artwork = artworks[selected]
  const transition = usePaperTransition(`${selected}-${open}`, enabled, 'scroll')
  const setUnrolled = (value: boolean) => { transition.prepare(value ? 'expand' : 'collapse'); setOpen(value) }
  return <div className="handscroll-exhibit" data-reveal>
    <div className="volume-shelf" role="group" aria-label="选择山水画卷">{artworks.map((item, index) =>
      <div className={`volume ${selected === index ? 'selected' : ''}`} key={item.id}>
        <button className="volume-select" aria-label={`展开${item.title}`} aria-pressed={selected === index} onClick={() => { if (selected === index && open) return; transition.prepare(open ? 'scroll' : 'expand'); setSelected(index); setOpen(true) }}><span className="volume-index">{item.number}</span><span>{item.title}</span><small>{['山之卷', '水之卷', '松之卷'][index]}</small></button>
        <button className={`icon-button bookmark ${saved.includes(item.id) ? 'is-saved' : ''}`} aria-label={`${saved.includes(item.id) ? '取消收藏' : '收藏'}${item.title}`} aria-pressed={saved.includes(item.id)} title="收藏册页" onClick={() => onSave(item)}><Bookmark size={19} fill={saved.includes(item.id) ? 'currentColor' : 'none'} /></button>
      </div>)}</div>
    <div ref={transition.host} className={`handscroll ${open ? 'is-open' : 'is-closed'}`}>
      <span className="wooden-roller roller-left" aria-hidden="true" />
      <div ref={transition.content} className="handscroll-sheet" id="collection-scroll" aria-hidden={!open} inert={!open}>
        <button className="scroll-art" aria-label={`查看${artwork.title}`} onClick={() => onOpen(artwork)}><ArtworkImage key={artwork.id} name={artwork.image} alt={`${artwork.title}：${artwork.subtitle}`} position={artwork.position} /><span className="scroll-art-hint"><ArrowUpRight size={24} /></span></button>
        <div className="scroll-colophon"><span className="colophon-index">卷 {artwork.number}</span><h3>{artwork.title}</h3><p>{artwork.subtitle}</p><button className="text-link" onClick={() => onOpen(artwork)}>细观此卷 <ArrowUpRight size={18} /></button><span className="colophon-signature">山水之间 录</span></div>
      </div>
      <span className="wooden-roller roller-right" aria-hidden="true" />
      {!open && <button className="rolled-label" onClick={() => { setUnrolled(true); toggle.current?.focus() }}>{artwork.title}<ChevronsRight size={22} /></button>}
    </div>
    <div className="scroll-toolbar"><p>{artwork.caption}</p><button ref={toggle} className="text-link" aria-expanded={open} aria-controls="collection-scroll" aria-label={open ? '收起画卷' : '展开画卷'} onClick={() => setUnrolled(!open)}>{open ? <ChevronsLeft size={19} /> : <ChevronsRight size={19} />}{open ? '收卷' : '展卷'}</button></div>
  </div>
}
