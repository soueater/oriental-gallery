import { useEffect, useState } from 'react'
import { ImageOff } from 'lucide-react'

type Props = {
  name: string; alt: string; className?: string; position?: string; eager?: boolean;
}
export function ArtworkImage({ name, alt, className = '', position, eager = false }: Props) {
  const [attempt, setAttempt] = useState(0)
  const key = `${name}-${attempt}`
  const [state, setState] = useState({ key, value: 'loading' })
  const status = state.key === key ? state.value : 'loading'
  const suffix = attempt ? `?retry=${attempt}` : ''
  useEffect(() => {
    if (status !== 'error') return
    const retry = () => setAttempt(value => value + 1)
    window.addEventListener('online', retry)
    return () => window.removeEventListener('online', retry)
  }, [status])
  return <span className={`art-picture ${className}`} data-image-state={status} aria-busy={status === 'loading'} aria-hidden={alt ? undefined : true}>
    <picture key={key}>
    <source type="image/webp" srcSet={`/assets/${name}-768.webp${suffix} 768w, /assets/${name}-1536.webp${suffix} 1536w`}
      sizes={className.includes('landscape') || className.includes('scroll-painting') ? '100vw' : '(max-width: 600px) 100vw, (max-width: 1000px) 70vw, 65vw'} />
    <img src={`/assets/${name}-1536.webp${suffix}`} alt={alt} loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'} decoding="async" width={1536} height={name.startsWith('hero') ? 1024 : 512}
      style={{ objectPosition: position }} onLoad={() => setState({ key, value: 'loaded' })} onError={() => setState({ key, value: 'error' })} />
    </picture>
    {alt && status !== 'loaded' && <span className="artwork-state" role="status">{status === 'error' && <ImageOff size={22} strokeWidth={1} />}<span>{status === 'error' ? '画境暂未载入' : '画境载入中'}</span></span>}
  </span>
}
