import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { motion } from '../animation'

type Effect = 'page' | 'cover' | 'scroll' | 'scene' | 'expand' | 'collapse'
type Snapshot = { ghost: HTMLElement | null; effect: Effect }

export function usePaperTransition(key: string | number, enabled: boolean, effect: Effect) {
  const host = useRef<HTMLDivElement>(null)
  const content = useRef<HTMLDivElement>(null)
  const pending = useRef<Snapshot | null>(null)
  const active = useRef<(() => void) | null>(null)

  const prepare = (nextEffect = effect) => {
    active.current?.()
    pending.current?.ghost?.remove()
    pending.current = null
    if (!enabled || !content.current || !host.current) return
    const source = content.current, bounds = source.getBoundingClientRect(), parent = host.current.getBoundingClientRect()
    let ghost: HTMLElement | null = null
    if (getComputedStyle(source).visibility !== 'hidden' && bounds.width && bounds.height) {
      ghost = source.cloneNode(true) as HTMLElement
      ghost.classList.add('transition-ghost')
      ghost.setAttribute('aria-hidden', 'true')
      ghost.inert = true
      for (const node of [ghost, ...ghost.querySelectorAll('[id]')]) node.removeAttribute('id')
      for (const node of ghost.querySelectorAll('[data-count]')) node.removeAttribute('data-count')
      Object.assign(ghost.style, { left: `${bounds.left - parent.left}px`, top: `${bounds.top - parent.top}px`, width: `${bounds.width}px`, height: `${bounds.height}px` })
    }
    pending.current = { ghost, effect: nextEffect }
  }

  useLayoutEffect(() => {
    const snapshot = pending.current
    pending.current = null
    const stage = host.current, sheet = content.current
    if (!snapshot || !enabled || !stage || !sheet) { snapshot?.ghost?.remove(); return }
    const { ghost, effect: current } = snapshot
    if (ghost) stage.appendChild(ghost)
    stage.dataset.transitioning = current
    let disposed = false
    let context: gsap.Context | null = null
    const dispose = () => {
      if (disposed) return
      disposed = true
      context?.revert()
      ghost?.remove()
      delete stage.dataset.transitioning
      if (active.current === dispose) active.current = null
    }
    try {
      context = gsap.context(() => {
        const timeline = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: dispose })
        if (current === 'page' || current === 'cover') {
          if (ghost) timeline.to(ghost, { rotationY: -158, transformPerspective: motion.paper.perspective, transformOrigin: 'left center', duration: current === 'page' ? motion.paper.turn : motion.paper.cover }, 0)
          timeline.fromTo(sheet, { opacity: .25, rotationY: 7, transformPerspective: motion.paper.perspective, transformOrigin: 'left center' }, { opacity: 1, rotationY: 0, duration: motion.paper.turn * .8 }, .18)
        } else if (current === 'collapse') {
          if (ghost) timeline.to(ghost, { clipPath: 'inset(0 49% 0 49%)', opacity: .6, duration: motion.paper.scroll }, 0)
        } else {
          if (ghost) timeline.to(ghost, { clipPath: 'inset(0 100% 0 0)', opacity: .35, duration: motion.paper.retreat }, 0)
          timeline.fromTo(sheet, { clipPath: current === 'expand' ? 'inset(0 49% 0 49%)' : 'inset(0 100% 0 0)', opacity: .35 }, { clipPath: 'inset(0 0% 0 0%)', opacity: 1, duration: motion.paper.scroll, ease: 'power3.out' }, ghost ? .2 : 0)
        }
      }, stage)
      active.current = dispose
    } catch { dispose() }
    return dispose
  }, [key, enabled])

  useEffect(() => () => { active.current?.(); pending.current?.ghost?.remove() }, [])
  return { host, content, prepare }
}
