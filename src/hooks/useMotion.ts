import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from '../animation'
import { chineseNumber } from '../typography/numbers'

gsap.registerPlugin(ScrollTrigger)

export function useMotionPreference() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return { reduced, enabled: !reduced && !paused, paused, setPaused }
}

export function useGalleryMotion(enabled: boolean) {
  const root = useRef<HTMLDivElement>(null)
  const counted = useRef(false)
  const entered = useRef(false)
  const revealed = useRef(new WeakSet<HTMLElement>())
  const scrollOpened = useRef(false)
  const pathDrawn = useRef(false)
  useEffect(() => {
    if (!root.current || !enabled) return
    const scope = root.current
    const media = gsap.matchMedia()
    let refreshTimer = 0
    const observer = new ResizeObserver(() => {
      window.clearTimeout(refreshTimer)
      refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 180)
    })
    observer.observe(scope)
    try {
      media.add({ desktop: '(min-width: 900px)', mobile: '(max-width: 899px)' }, (context) => {
        const desktop = context.conditions?.desktop
        if (counted.current) scope.querySelectorAll<HTMLElement>('[data-count]').forEach(element => {
          element.textContent = chineseNumber(Number(element.dataset.count))
        })
        if (!entered.current) {
          const intro = gsap.timeline({ defaults: { ease: motion.ease }, onComplete: () => { entered.current = true } })
          intro.from('.landscape-far', { opacity: 0, scale: 1.025, duration: motion.entry })
          .from('.landscape-middle', { opacity: 0, duration: 1.1 }, 0.18)
          .from('.landscape-near', { opacity: 0, y: 16, duration: 1.2 }, 0.32)
          .from('.hero-title-line', { yPercent: 105, opacity: 0, stagger: 0.12, duration: 1.1 }, 0.32)
          .from('.hero-enter', { opacity: 0, y: 14, duration: 0.65, stagger: 0.09 }, 0.6)
        }

        gsap.utils.toArray<HTMLElement>('[data-reveal]', scope).forEach((element) => {
          if (revealed.current.has(element)) return
          gsap.from(element, { opacity: 0, y: 22, duration: motion.reveal, ease: motion.ease,
            onComplete: () => revealed.current.add(element),
            scrollTrigger: { trigger: element, start: 'top 100%', once: true } })
        })

        if (desktop) {
          const scroll = { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 1.2 }
          gsap.to('.landscape-far', { y: motion.parallax.far, ease: 'none', scrollTrigger: scroll })
          gsap.to('.landscape-middle', { y: motion.parallax.middle, ease: 'none', scrollTrigger: scroll })
          gsap.to('.landscape-near', { y: motion.parallax.near, ease: 'none', scrollTrigger: scroll })
          if (!scrollOpened.current) gsap.from('.scroll-painting', { clipPath: 'inset(0 98% 0 0)', ease: 'none',
            onComplete: () => { scrollOpened.current = true },
            scrollTrigger: { trigger: '.scroll-view', start: 'top 85%', end: 'top 25%', scrub: 0.8, once: true } })
        }

        const path = scope.querySelector<SVGPathElement>('.journey-ink-path')
        if (path && !pathDrawn.current) {
          const length = path.getTotalLength()
          gsap.fromTo(path, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0,
            onComplete: () => { pathDrawn.current = true },
            ease: 'none', scrollTrigger: { trigger: '#journey', start: 'top 75%', end: 'bottom 80%', scrub: 0.6, once: true } })
        }
        scope.querySelectorAll<HTMLElement>('.journey-step').forEach((step) => {
          ScrollTrigger.create({ trigger: step, start: 'top 82%', once: true,
            onEnter: () => step.classList.add('is-visited') })
        })

        if (!counted.current) {
          const trigger = ScrollTrigger.create({ trigger: '#numbers', start: 'top 90%', once: true, onEnter: () => {
            counted.current = true
            scope.querySelectorAll<HTMLElement>('[data-count]').forEach((element) => {
              const target = Number(element.dataset.count)
              const value = { current: 0 }
              gsap.to(value, { current: target, duration: 1.1, ease: 'power1.out',
                onUpdate: () => { element.textContent = chineseNumber(Math.round(value.current)) },
                onComplete: () => { element.textContent = chineseNumber(target) } })
            })
            trigger.kill()
          } })
        }
      }, scope)
    } catch (error) {
      media.revert()
      console.warn('Animation unavailable; all gallery content remains visible.', error)
    }
    return () => {
      observer.disconnect()
      window.clearTimeout(refreshTimer)
      media.revert()
      if (counted.current) scope.querySelectorAll<HTMLElement>('[data-count]').forEach(element => {
        element.textContent = chineseNumber(Number(element.dataset.count))
      })
    }
  }, [enabled])
  return root
}

export function useSceneReveal(index: number, enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!enabled || !ref.current) return
    const animation = gsap.fromTo(ref.current, { opacity: 0.55, clipPath: 'inset(0 12% 0 0)' },
      { opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: motion.scene, ease: motion.ease })
    return () => { animation.revert() }
  }, [index, enabled])
  return ref
}
