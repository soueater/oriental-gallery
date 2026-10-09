export function Seal({ compact = false }: { compact?: boolean }) {
  return <span className={compact ? 'brand-seal' : 'closing-signature'} role="img" aria-label="山水之间，朱砂方印">
    <svg className="seal-frame" viewBox="0 0 112 112" fill="none" aria-hidden="true">
      <path d="M3 40 3.5 6 Q3 3 7 3 L30 3.5 M35 3 74 3.5 M78 3 106 4 Q109 4 109 8 L108.5 33 M109 37 109 82 M109 87 108 106 Q108 109 104 109 L76 108.5 M72 109 34 108.5 M29 109 7 108 Q3 108 3 104 L3.5 77 M3 73 3 45" stroke="currentColor" strokeWidth="3.5" strokeLinecap="square" />
      <path d="M10 35 10 10 43 10 M48 10 101 11 102 55 M102 60 101 102 62 101 M57 102 11 101 10 39" stroke="currentColor" strokeWidth="1.25" opacity=".75" />
      <path d="M5 15 5 23 M99 5 105 5 M107 94 107 100 M14 106 23 106" stroke="currentColor" strokeWidth="2" opacity=".55" />
    </svg>
    <span className="seal-characters" aria-hidden="true"><span>山</span><span>水</span><span>之</span><span>间</span></span>
  </span>
}
