import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUpRight, ArrowRight, ArrowLeft, Bookmark, Check, Menu, Pause, Play, X, Heart } from 'lucide-react'
import { artworks, navigation, scenes, steps } from './content'
import type { Artwork } from './content'
import { ArtworkImage } from './components/ArtworkImage'
import { Modal } from './components/Modal'
import { Water } from './components/Water'
import { Handscroll } from './components/Handscroll'
import { Ledger } from './components/Ledger'
import { Seal } from './components/Seal'
import { sealText } from './typography/text'
import { useGalleryMotion, useMotionPreference } from './hooks/useMotion'
import { usePaperTransition } from './hooks/usePaperTransition'
import { useInkNavigation } from './hooks/useInkNavigation'

type Dialog = { type: 'artwork'; artwork: Artwork } | { type: 'guide' | 'saved' | 'about' | 'rights' | 'feedback' } | null

function readSaved(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem('shanshui-favorites') || '[]')
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string' && artworks.some(a => a.id === id)) : []
  } catch { return [] }
}

export default function App() {
  const { enabled, reduced, paused, setPaused } = useMotionPreference()
  const root = useGalleryMotion(enabled)
  useInkNavigation(root, enabled)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dialog, setDialog] = useState<Dialog>(null)
  const [scene, setScene] = useState(0)
  const [saved, setSaved] = useState<string[]>(readSaved)
  const [notice, setNotice] = useState('')
  const [feedback, setFeedback] = useState(() => {
    try { return localStorage.getItem('shanshui-feedback') || '' } catch { return '' }
  })
  const [feedbackError, setFeedbackError] = useState('')
  const feedbackInput = useRef<HTMLTextAreaElement>(null)
  const sceneTransition = usePaperTransition(scene, enabled, 'scene')
  const touch = useRef<{ x: number; y: number } | null>(null)
  const menuButton = useRef<HTMLButtonElement>(null)
  const menuPanel = useRef<HTMLElement>(null)
  const hero = useRef<HTMLElement>(null)
  const [heroActive, setHeroActive] = useState(true)

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', update, { passive: true }); update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  useEffect(() => {
    const onVisibility = () => {
      const rect = hero.current?.getBoundingClientRect()
      setHeroActive(!document.hidden && !!rect && rect.bottom > 0 && rect.top < window.innerHeight)
    }
    const observer = new IntersectionObserver(([entry]) => setHeroActive(entry.isIntersecting && !document.hidden))
    if (hero.current) observer.observe(hero.current)
    document.addEventListener('visibilitychange', onVisibility)
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', onVisibility) }
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    menuPanel.current?.querySelector<HTMLElement>('a')?.focus()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus() }
      if (event.key === 'Tab') {
        const links = Array.from(menuPanel.current?.querySelectorAll<HTMLElement>('a, button') || [])
        const first = links[0], last = links[links.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    const query = window.matchMedia('(min-width: 801px)')
    const resized = () => { if (query.matches) setMenuOpen(false) }
    query.addEventListener('change', resized)
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', onKey); query.removeEventListener('change', resized) }
  }, [menuOpen])

  useEffect(() => {
    if (!enabled || !window.matchMedia('(pointer: fine) and (min-width: 900px)').matches) return
    const element = hero.current!
    let frame = 0, x = 0, y = 0
    const update = () => {
      element.style.setProperty('--pointer-x', `${x}px`)
      element.style.setProperty('--pointer-y', `${y}px`)
      frame = 0
    }
    const pointer = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect()
      x = ((event.clientX - rect.left) / rect.width - 0.5) * 7
      y = ((event.clientY - rect.top) / rect.height - 0.5) * 4
      if (!frame) frame = requestAnimationFrame(update)
    }
    const reset = () => { x = y = 0; if (!frame) frame = requestAnimationFrame(update) }
    element.addEventListener('pointermove', pointer); element.addEventListener('pointerleave', reset)
    return () => { cancelAnimationFrame(frame); element.removeEventListener('pointermove', pointer); element.removeEventListener('pointerleave', reset); element.style.removeProperty('--pointer-x'); element.style.removeProperty('--pointer-y') }
  }, [enabled])

  useEffect(() => {
    if (!notice) return
    const timeout = setTimeout(() => setNotice(''), 3500)
    return () => clearTimeout(timeout)
  }, [notice])

  useEffect(() => {
    const offline = () => setNotice('网络已断开，已加载的画境仍可浏览。')
    const online = () => setNotice('网络已恢复，未加载的画境正在重试。')
    window.addEventListener('offline', offline)
    window.addEventListener('online', online)
    return () => { window.removeEventListener('offline', offline); window.removeEventListener('online', online) }
  }, [])

  const toggleSaved = (artwork: Artwork) => {
    const next = saved.includes(artwork.id) ? saved.filter(id => id !== artwork.id) : [...saved, artwork.id]
    setSaved(next)
    try { localStorage.setItem('shanshui-favorites', JSON.stringify(next)); setNotice(next.includes(artwork.id) ? `已将「${artwork.title}」收入我的册页` : `已取消收藏「${artwork.title}」`) }
    catch { setNotice('本次收藏已更新；当前浏览器无法保存，下次打开将不会保留。') }
  }
  const changeScene = (offset: number) => { sceneTransition.prepare(); setScene(current => (current + offset + scenes.length) % scenes.length) }
  const selectScene = (index: number) => { if (index === scene) return; sceneTransition.prepare(); setScene(index) }
  const currentScene = scenes[scene]
  const close = () => setDialog(null)
  const openArtwork = (artwork: Artwork) => setDialog({ type: 'artwork', artwork })

  return <div ref={root} className="gallery" data-motion={enabled ? 'on' : 'off'} data-environment={heroActive ? 'active' : 'paused'}>
    <a className="skip-link" href="#main">跳转正文</a>
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="header-inner">
        <a className="brand" href="#home" aria-label="山水之间，回到首页"><Seal compact /><span className="brand-name">山水之间<small>东方美学数字展馆</small></span></a>
        <nav className="desktop-nav" aria-label="主导航">{navigation.map(item => <a key={item.id} href={`#${item.id}`}>{item.label}</a>)}</nav>
        <div className="header-tools">
          <button className="icon-button motion-toggle" title={reduced ? '系统已启用减少动态效果' : paused ? '播放动态效果' : '暂停动态效果'} aria-label={reduced ? '系统已启用减少动态效果' : paused ? '播放动态效果' : '暂停动态效果'} disabled={reduced} aria-pressed={!enabled} onClick={() => setPaused(!paused)}>{enabled ? <Pause size={17} /> : <Play size={17} />}</button>
          <button className="saved-button" aria-label="我的册页" onClick={() => setDialog({ type: 'saved' })}><Bookmark size={15} /><span>我的册页</span>{saved.length > 0 && <span className="saved-count">{saved.length}</span>}</button>
          <a className="nav-entry" href="#scenes">入画 <ArrowUpRight size={17} /></a>
          <button ref={menuButton} className="icon-button menu-toggle" aria-label={menuOpen ? '关闭菜单' : '打开菜单'} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </div>
    </header>
    <span className="navigation-ink" aria-hidden="true" />
    {menuOpen && <nav id="mobile-menu" ref={menuPanel} className="mobile-menu" aria-label="移动端主导航">
      <button className="icon-button mobile-close" aria-label="关闭导航菜单" onClick={() => { setMenuOpen(false); menuButton.current?.focus() }}><X /></button>
      <span className="eyebrow">一卷山水 · 四处停留</span>
      {navigation.map((item, index) => <a key={item.id} href={`#${item.id}`} onClick={() => setMenuOpen(false)}><small>{index + 1}</small>{item.label}<ArrowUpRight size={20} /></a>)}
      <button className="text-link" onClick={() => { setMenuOpen(false); setDialog({ type: 'guide' }) }}>打开观展导览 <ArrowRight size={18} /></button>
    </nav>}

    <main id="main" tabIndex={-1}>
      <section id="home" className="hero" ref={hero} aria-labelledby="hero-title">
        <div className="landscape-pointer" aria-hidden="true">
          <ArtworkImage name="hero-background" alt="" className="landscape-layer landscape-far" eager />
          <ArtworkImage name="hero-background" alt="" className="landscape-layer landscape-middle" eager />
          <ArtworkImage name="hero-foreground" alt="" className="landscape-layer landscape-near" eager />
        </div>
        <div className="mist mist-one" aria-hidden="true" /><div className="mist mist-two" aria-hidden="true" />
        <Water enabled={enabled && heroActive} />
        <div className="hero-inner page-width">
          <p className="hero-eyebrow hero-enter"><span className="tiny-line" /><span className="hero-caption-text"><span className="heading-phrase">一卷山水，</span><wbr /><span className="heading-phrase">观照内心</span></span></p>
          <h1 id="hero-title"><span className="title-mask"><span className="hero-title-line">山水之间</span></span><span className="title-mask"><span className="hero-title-line title-small">心有远境</span></span></h1>
          <p className="hero-description hero-enter">循一缕墨香，入一卷山河。<br />在山、水与留白之间，重逢东方的诗意。</p>
          <div className="hero-actions hero-enter"><a className="button button-ink" href="#collection">展开画卷 <ArrowRight size={18} /></a><button className="guide-link" onClick={() => setDialog({ type: 'guide' })}><span className="play-circle"><Play size={12} /></span> 观展导览</button></div>
        </div>
        <p className="vertical-note hero-enter">可游 · 可观 · 可居</p>
        <div className="hero-foot page-width hero-enter"><a className="explore" href="#collection"><ArrowDown size={16} /><span>向下，移步入境</span></a><span className="hero-caption">宋韵山水 <span>／</span> 当代数字演绎</span><span className="hero-volume">卷一 <i /> 山水清音</span></div>
      </section>

      <section id="collection" className="collection section-space page-width" aria-labelledby="collection-title">
        <div className="section-heading" data-reveal><div><p className="eyebrow"><span>01</span> 册页观物</p><h2 id="collection-title"><span className="heading-phrase">一页山水，</span><wbr /><span className="heading-phrase">一方天地。</span></h2></div><p className="section-intro">不急着看完，也不必寻找答案。<br />从一座山、一湾水、一株松树开始。</p></div>
        <Handscroll saved={saved} onSave={toggleSaved} onOpen={openArtwork} enabled={enabled} />
        <div className="collection-note" data-reveal><span>以笔墨为径，以留白为境。</span><button className="text-link" onClick={() => setDialog({ type: 'saved' })}>翻阅我的册页 <ArrowUpRight size={17} /></button></div>
      </section>

      <section id="numbers" className="numbers-band" aria-labelledby="numbers-title"><div className="page-width"><Ledger enabled={enabled}>
        <div className="numbers-copy" data-reveal><p className="eyebrow"><span>02</span> 以数见境</p><h2 id="numbers-title">小小展馆，<br />慢慢看见。</h2><p>让丰富藏在细节里，<br />让观看回到简单。</p><div className="metric-row">{[{ value: 3, label: '观看主题' }, { value: 2, label: '原创画境' }, { value: 4, label: '观展步序' }].map(item => <div className="metric" key={item.label}><strong data-count={item.value}>{String(item.value).padStart(2, '0')}</strong><span>{item.label}</span></div>)}</div></div>
      </Ledger></div></section>

      <section id="journey" className="journey section-space page-width" aria-labelledby="journey-title">
        <div className="section-heading" data-reveal><div><p className="eyebrow"><span>03</span> 循迹而行</p><h2 id="journey-title"><span className="heading-phrase">循一条径，</span><wbr /><span className="heading-phrase">赴一场心游。</span></h2></div><p className="section-intro">每一次驻足，都是与山水的相遇。<br />以四步，完成一场自在的观看。</p></div>
        <div className="journey-track"><svg className="journey-line" viewBox="0 0 1200 90" preserveAspectRatio="none" aria-hidden="true"><path className="journey-base" d="M20 60 C130 20 210 95 330 48 S535 30 635 60 S830 20 930 48 S1100 70 1180 28" /><path className="journey-ink-path" d="M20 60 C130 20 210 95 330 48 S535 30 635 60 S830 20 930 48 S1100 70 1180 28" /></svg>
          {steps.map(step => <article key={step.number} className="journey-step" data-reveal><div className="step-number"><span>{step.number}</span><Check className="step-check" size={13} aria-hidden="true" /></div><h3>{step.title}</h3><p className="step-word">{step.word}</p><p>{step.text}</p></article>)}
        </div>
      </section>

      <section id="scenes" className="scenes" aria-labelledby="scenes-title">
        <div className="section-heading page-width" data-reveal><div><p className="eyebrow"><span>04</span> 移步换景</p><h2 id="scenes-title"><span className="heading-phrase">山水不尽，</span><wbr /><span className="heading-phrase">意在卷外。</span></h2></div><div className="scene-controls"><span className="scene-counter" aria-live="polite">{currentScene.number}<span> / 03</span></span><button className="icon-button circle-button" aria-label="上一幅画境" title="上一幅画境" onClick={() => changeScene(-1)}><ArrowLeft size={19} /></button><button className="icon-button circle-button" aria-label="下一幅画境" title="下一幅画境" onClick={() => changeScene(1)}><ArrowRight size={19} /></button></div></div>
        <div ref={sceneTransition.host} className="scroll-view" onTouchStart={event => { touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY } }} onTouchCancel={() => { touch.current = null }} onTouchEnd={event => { if (touch.current !== null) { const distance = event.changedTouches[0].clientX - touch.current.x; const vertical = Math.abs(event.changedTouches[0].clientY - touch.current.y); if (Math.abs(distance) > 55 && Math.abs(distance) > vertical * 1.3) changeScene(distance > 0 ? -1 : 1) }; touch.current = null }}>
          <div className="scroll-stage" ref={sceneTransition.content}><ArtworkImage name={currentScene.image} alt={`${currentScene.title}：${currentScene.text}`} className="scroll-painting" position={currentScene.position} /><div className="scene-title"><span>{currentScene.subtitle}</span><h3>{currentScene.title}</h3><i /></div></div>
          <div className="scroll-axis" aria-hidden="true" />
        </div>
        <div className="scene-bottom page-width"><div className="scene-narrative" aria-live="polite" key={scene}><p className="scene-quote">{currentScene.quote}</p><p>{currentScene.text}</p></div><div className="scene-actions"><div className="scene-dots" aria-label="选择画境">{scenes.map((item, index) => <button key={item.number} className={scene === index ? 'active' : ''} aria-label={`切换到${item.title}`} aria-pressed={scene === index} onClick={() => selectScene(index)}><span>{item.number}</span></button>)}</div><button className="text-link" onClick={() => openArtwork(artworks.find(artwork => artwork.id === currentScene.artwork)!)}>细看此景 <ArrowUpRight size={18} /></button></div></div>
      </section>

      <section id="about" className="about section-space page-width" aria-labelledby="about-title"><div className="about-label" data-reveal><p className="eyebrow"><span>05</span> 古意新呈</p><span className="about-vertical">取古人之意<br />写今日之境</span></div><div className="about-text" data-reveal><h2 id="about-title">让古典的美，<br />在此刻发生。</h2><p>山水之间，是一次关于东方美学的数字探索。我们借宋式山水的构图、笔墨与留白，以当代的方式重新观看自然。</p><p>这里的作品是原创数字画境，承接古典的审美语言，也为今天的目光留下自由。无需懂画，来此停留，便是相遇。</p><button className="text-link" onClick={() => setDialog({ type: 'about' })}>读一读展馆手记 <ArrowUpRight size={17} /></button></div><div className="about-detail" data-reveal><ArtworkImage name="hero" alt="山石旁的水岸亭台与松林细节" position="70% 74%" /><span>山水可居，心境可游。</span></div></section>

      <section className="closing" aria-labelledby="closing-title"><ArtworkImage name="hero" alt="" className="closing-landscape" /><div className="closing-inner page-width" data-reveal><p className="eyebrow">山水有尽，余韵无穷</p><h2 id="closing-title">留一片山水，<br className="mobile-break" />给心里的远方。</h2><p>不妨再看一眼，或把喜欢的风景收入册页。</p><button className="button button-ink" onClick={() => setDialog({ type: 'saved' })}><Bookmark size={17} /> 打开我的册页 <ArrowRight size={18} /></button><Seal /></div></section>
    </main>

    <footer className="site-footer page-width"><div className="footer-brand"><span className="footer-name">山水之间</span><span>东方美学数字展馆</span></div><div className="footer-links"><button onClick={() => setDialog({ type: 'about' })}>展馆手记</button><button onClick={() => setDialog({ type: 'rights' })}>作品说明</button><button onClick={() => { setFeedbackError(''); setDialog({ type: 'feedback' }) }}>联系与反馈</button><a href="#home" aria-label="回到首页">回到卷首 <ArrowUpRight size={15} /></a></div><p className="copyright">© 2026 山水之间 · 数字创作与美学探索</p></footer>
    <div className="toast" role="status" aria-live="polite">{notice && <><Check size={17} />{notice}</>}</div>

    {dialog && <Modal title={dialog.type === 'artwork' ? dialog.artwork.title : { guide: '一卷山水，如何观之', saved: '我的册页', about: '展馆手记', rights: '作品与素材说明', feedback: '留下你的观展感受' }[dialog.type]} onClose={close}>
      {dialog.type === 'artwork' && <div className="artwork-book"><div className="artwork-verso"><ArtworkImage name={dialog.artwork.image} alt={dialog.artwork.title} className="dialog-art" position={dialog.artwork.position} /><p className="dialog-meta">{dialog.artwork.caption} · 山水之间原创画境 · 2026</p></div><div className="artwork-recto"><p>{dialog.artwork.description}</p><ul className="observation-list">{dialog.artwork.observations.map(item => <li key={item}>{item}</li>)}</ul><button className="button button-ink" aria-pressed={saved.includes(dialog.artwork.id)} onClick={() => toggleSaved(dialog.artwork)}><Heart size={17} fill={saved.includes(dialog.artwork.id) ? 'currentColor' : 'none'} />{saved.includes(dialog.artwork.id) ? '已收入册页 · 取消收藏' : '收入我的册页'}</button></div></div>}
      {dialog.type === 'guide' && <><p>这是一座可以慢慢逛的数字展馆。沿画卷向下，或者从导航选择一处停留。</p><ol className="guide-steps">{steps.map(step => <li key={step.number}><span>{step.number}</span><div><h3>{step.title} · {step.word}</h3><p>{step.text}</p></div></li>)}</ol><a className="button button-ink" href="#collection" onClick={close}>从册页开始 <ArrowRight size={18} /></a></>}
      {dialog.type === 'saved' && <><p>收藏保存在当前浏览器中，可随时增删。</p>{saved.length === 0 ? <div className="empty-album"><Bookmark size={30} strokeWidth={1} /><h3>册页尚空，山水待你。</h3><p>在作品旁轻点书签，留下喜欢的风景。</p><a href="#collection" className="text-link" onClick={close}>去看看册页 <ArrowRight size={17} /></a></div> : <div className="saved-list">{artworks.filter(a => saved.includes(a.id)).map(artwork => <div key={artwork.id}><button className="saved-art-link" onClick={() => openArtwork(artwork)}><ArtworkImage name={artwork.image} alt="" position={artwork.position} /><span>{artwork.title}<small>{artwork.subtitle}</small></span></button><button className="icon-button" title="移出册页" aria-label={`移出${artwork.title}`} onClick={() => toggleSaved(artwork)}><X size={18} /></button></div>)}</div>}</>}
      {dialog.type === 'about' && <><p>古典山水不只描绘地貌，也安排观看的节奏。远山淡，近树浓；一处有笔墨，一处留空白。眼睛在其间游走，人也暂时走出了日常。</p><p>“山水之间”以这样的秩序为起点。画境由生成式图像工具原创制作，网页则以真实文字、原生滚动和克制的动态延续这段观看。</p><p>页面中的短句均为本展馆原创文案，没有借托古人署名。愿这卷山水成为一次轻松、清楚，也足够安静的相遇。</p><a className="text-link" href="#scenes" onClick={close}>再入画境 <ArrowRight size={18} /></a></>}
      {dialog.type === 'rights' && <><p>画境：本项目使用生成式图像工具原创生成两幅宋韵山水数字作品，册页与场景使用其整体及局部。它们不是古代绘画原作，也不代表任何博物馆藏品。</p><p>字体：全站中文采用崇羲篆体。书写：王心怡；参与：谢清俊、庄德明、季旭昇。遵循姓名标示、禁止改作授权，保留原始字库。篆字以繁体显示，控制名称保留简体无障碍标记。</p><a className="text-link" href="https://xiaoxue.iis.sinica.edu.tw/chongxi/copyright.htm" target="_blank" rel="noreferrer">字体来源与授权 <ArrowUpRight size={17} /></a><p>“观展足迹”明确标注演示数据。收藏与观展反馈仅保存在当前浏览器，不会发送到服务器。</p></>}
      {dialog.type === 'feedback' && <form onSubmit={event => {
        event.preventDefault()
        if (feedback.trim().length < 5) { setFeedbackError('请写下至少 5 个字的观展感受。'); feedbackInput.current?.focus(); return }
        try { localStorage.setItem('shanshui-feedback', feedback.trim()); setFeedbackError(''); setNotice('观展感受已保存到本机，未向任何人发送。'); close() }
        catch { setFeedbackError('当前浏览器无法保存。你可以复制这段文字留存。') }
      }}><p>这里尚未接入邮件或后台。你可以写下感受并保存到本机；内容不会发送给展馆。</p><label htmlFor="feedback">观展感受</label><textarea ref={feedbackInput} id="feedback" aria-label="观展感受" value={sealText(feedback)} onChange={event => { setFeedback(event.target.value); if (event.target.value.trim().length >= 5 && feedbackError.startsWith('请写下至少')) setFeedbackError('') }} maxLength={1000} rows={5} aria-invalid={!!feedbackError && feedback.trim().length < 5} aria-describedby="feedback-error" placeholder="哪一处山水让你想多停留片刻？" /><p id="feedback-error" className="form-error" role="alert">{feedbackError}</p><button type="submit" className="button button-ink">保存到本机 <ArrowRight size={18} /></button></form>}
    </Modal>}
  </div>
}
