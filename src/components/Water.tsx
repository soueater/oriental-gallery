import { useEffect, useRef, useState } from 'react'
import { motion } from '../animation'

export function Water({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [desktop, setDesktop] = useState(() => window.matchMedia('(min-width: 601px)').matches)
  useEffect(() => {
    const query = window.matchMedia('(min-width: 601px)')
    const update = () => setDesktop(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  useEffect(() => {
    const canvas = ref.current
    if (!canvas || !enabled || !desktop) return
    const context = canvas.getContext('2d')
    if (!context) return
    let width = 0, height = 0, frame = 0, last = 0, elapsed = 0
    let visible = false
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width; height = rect.height
      const ratio = Math.min(window.devicePixelRatio || 1, motion.water.maxDpr)
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }
    const render = (time: number) => {
      if (!visible || document.hidden) { frame = 0; last = 0; return }
      if (!last || time - last >= 1000 / motion.water.fps) {
        elapsed += last ? Math.min(time - last, 100) : 0
        last = time
        context.clearRect(0, 0, width, height)
        context.lineWidth = 0.7
        for (let line = 0; line < 7; line++) {
          context.strokeStyle = `rgba(73,109,100,${0.13 - line * 0.011})`
          context.beginPath()
          for (let x = 0; x <= width * 0.72; x += 8) {
            const y = height * 0.25 + line * 15 + Math.sin(x / 100 + elapsed / 4200 + line) * motion.water.amplitude
            if (x === 0) context.moveTo(x, y); else context.lineTo(x, y)
          }
          context.stroke()
        }
      }
      frame = requestAnimationFrame(render)
    }
    const start = () => { if (visible && !document.hidden && !frame) frame = requestAnimationFrame(render) }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; start() })
    observer.observe(canvas)
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    document.addEventListener('visibilitychange', start)
    resize()
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', start)
      context.clearRect(0, 0, width, height)
    }
  }, [enabled, desktop])
  return <canvas className="water" ref={ref} aria-hidden="true" />
}
