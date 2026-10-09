export const motion = {
  entry: 1.4,
  reveal: 0.7,
  interaction: 0.22,
  scene: 0.75,
  paper: { turn: 0.9, cover: 0.9, scroll: 0.8, retreat: 0.3, navigation: 0.75, perspective: 1800 },
  stagger: 0.13,
  ease: 'power2.out',
  parallax: { far: 22, middle: 42, near: 64, pointer: 7 },
  water: { fps: 24, maxDpr: 1.5, amplitude: 1.6 },
} as const
