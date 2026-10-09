import { useEffect } from 'react'
import type { RefObject } from 'react'
import gsap from 'gsap'
import { motion } from '../animation'

export function useInkNavigation(root: RefObject<HTMLDivElement | null>, enabled: boolean) {
  useEffect(() => {
    const gallery = root.current
    if (!gallery) return
    let tween: gsap.core.Tween | null = null, frame = 0
    const stop = () => {
      tween?.kill(); tween = null
      cancelAnimationFrame(frame)
      delete gallery.dataset.navigating
      gallery.style.removeProperty('--navigation-progress')
    }
    const clicked = (event: MouseEvent) => {
      const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]')
      if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || anchor.classList.contains('skip-link')) return
      const target = document.getElementById(anchor.hash.slice(1))
      if (!target) return
      event.preventDefault()
      stop()
      if (location.hash !== anchor.hash) history.pushState(null, '', anchor.hash)
      frame = requestAnimationFrame(() => {
        const offset = (gallery.querySelector('header')?.getBoundingClientRect().height || 82) + 20
        const top = Math.max(0, Math.min(target.getBoundingClientRect().top + scrollY - offset, document.documentElement.scrollHeight - innerHeight))
        const focusTarget = () => { if (!target.hasAttribute('tabindex')) target.tabIndex = -1; target.focus({ preventScroll: true }) }
        if (!enabled) { window.scrollTo({ top, behavior: 'instant' }); focusTarget(); return }
        const position = { y: scrollY }
        gallery.dataset.navigating = 'true'
        tween = gsap.to(position, { y: top, duration: motion.paper.navigation, ease: 'power2.inOut',
          onUpdate: () => { window.scrollTo({ top: position.y, behavior: 'instant' }); gallery.style.setProperty('--navigation-progress', String(tween?.progress() || 0)) },
          onComplete: () => { delete gallery.dataset.navigating; tween = null; focusTarget() },
        })
      })
    }
    const key = (event: KeyboardEvent) => { if (['PageDown', 'PageUp', 'Home', 'End', ' ', 'ArrowDown', 'ArrowUp', 'Escape'].includes(event.key)) stop() }
    gallery.addEventListener('click', clicked)
    window.addEventListener('wheel', stop, { passive: true })
    window.addEventListener('touchstart', stop, { passive: true })
    window.addEventListener('keydown', key)
    return () => { stop(); gallery.removeEventListener('click', clicked); window.removeEventListener('wheel', stop); window.removeEventListener('touchstart', stop); window.removeEventListener('keydown', key) }
  }, [root, enabled])
}
