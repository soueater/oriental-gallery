import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  const exit = useRef<Animation | null>(null)
  const requestClose = () => {
    const dialog = ref.current
    if (!dialog || exit.current) return
    if (dialog.closest('[data-motion="off"]') || !dialog.animate) { closeRef.current(); return }
    const style = getComputedStyle(dialog)
    const start = { opacity: style.opacity, transform: style.transform }
    dialog.style.animation = 'none'
    exit.current = dialog.animate([start, { opacity: 0, transform: 'translateY(16px) scale(.985)' }], { duration: 240, easing: 'ease-in', fill: 'forwards' })
    exit.current.finished.then(() => closeRef.current()).catch(() => {})
  }
  useEffect(() => {
    const dialog = ref.current!
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    const onCancel = (event: Event) => { event.preventDefault(); requestClose() }
    dialog.addEventListener('cancel', onCancel)
    return () => {
      dialog.removeEventListener('cancel', onCancel)
      exit.current?.cancel()
      dialog.close()
      document.body.style.overflow = overflow
      previous?.focus({ preventScroll: true })
    }
  }, [])
  return <dialog ref={ref} className="paper-dialog" aria-labelledby="dialog-title" onClick={(event) => {
    if (event.target === event.currentTarget) {
      const rect = ref.current!.getBoundingClientRect()
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) requestClose()
    }
  }}>
    <div className="dialog-head"><span className="eyebrow">山水之间 · 册页</span><button className="icon-button" aria-label="关闭弹层" title="关闭" onClick={requestClose}><X size={21} /></button></div>
    <div className="dialog-folio" key={title}>
      <h2 id="dialog-title">{title === '留下你的观展感受' ? <><span className="heading-phrase">留下你的</span><wbr /><span className="heading-phrase">观展感受</span></> : title}</h2>
      {children}
    </div>
  </dialog>
}
